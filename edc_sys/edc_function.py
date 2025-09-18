"""
EDC 系統核心業務邏輯

提供 EDC 系統的主要功能，包括受試者管理、資格評估、資料驗證等。
"""

import json
import logging
import sys
import os
from dotenv import load_dotenv
from datetime import datetime, timedelta, date
sys.path.append(os.path.join(os.path.dirname(__file__), '..'))
from function_sys.sqlconn import sqlconn

logger = logging.getLogger(__name__)


class edc_db:
    """EDC 系統核心業務邏輯類別"""
    
    sql = None
    column_id = {'config': ['KEY', 'VALUE'], 'EDC': {'column_id_subjects': [], 'column_id_inclusion_criteria': [], 'column_id_exclusion_criteria': []}}
    config = dict()
    
    def __init__(self):
        """初始化 EDC 系統，載入配置並建立資料庫連接"""
        print("+++++++ INIT EDC ++++++")
        logging.info("edc_db/config path: " + os.path.join(os.path.dirname(__file__), 'config'))
        try:
            # 載入環境變數
            load_dotenv("edc_sys/.env")
            self.config = {
                'sql_host': os.getenv('EDC_SQL_HOST', 'localhost'),
                'sql_port': int(os.getenv('EDC_SQL_PORT', 3306)),
                'sql_user': os.getenv('EDC_SQL_USER'),
                'sql_passwd': os.getenv('EDC_SQL_PASSWD'),
                'sql_dbname': os.getenv('EDC_SQL_DBNAME')
            }
        except:
            with open(os.path.join(os.path.dirname(__file__), 'config.json'), 'r') as f:
                self.config=json.load(f)
        print(self.config)
        self.sql=sqlconn(self.config['sql_host'],self.config['sql_port'],self.config['sql_user'],self.config['sql_passwd'],self.config['sql_dbname'])
        self.get_col_id()
        # 保持連接開啟，不要立即關閉
    
    def get_col_id(self):
        """獲取資料庫欄位 ID 配置"""
        try:
            self.connect()
            col_ids = ['column_id_subjects', 'column_id_inclusion_criteria', 'column_id_exclusion_criteria', 'column_id_queries', 'column_id_edit_log']
            for col_id in col_ids:
                result = self.sql.search('config',['VALUE'], criteria=f"`ID` = '{col_id}'")
                self.column_id['EDC'][col_id] = result[0][0].split(',')
                print("Col ID: ", self.column_id['EDC'][col_id])
        except:
            raise Exception(f"Error occurs when getting config: '{col_ids}'")
    
    def connect_sql(self):
        """建立新的資料庫連接"""
        return sqlconn(self.config['sql_host'],self.config['sql_port'],self.config['sql_user'],self.config['sql_passwd'],self.config['sql_dbname'])
    
    def get_user_institution_code(self, user_id, verbose=0):
        """獲取使用者的機構代碼
        
        Args:
            user_id: 使用者ID
            verbose: 是否顯示詳細日誌
            
        Returns:
            機構代碼 (2位數字字串) 或 None
        """
        try:
            # 連接到 united_khh 資料庫查詢使用者資訊
            united_sql = sqlconn(
                self.config['sql_host'],
                self.config['sql_port'],
                self.config['sql_user'],
                self.config['sql_passwd'],
                'united_khh'  # 連接到 united_khh 資料庫
            )
            
            result = united_sql.search('user', ['INSTITUTION_CODE'], criteria=f"`UNIQUE_ID`='{user_id}'", verbose=verbose)
            
            if result and len(result) > 0 and len(result[0]) > 0:
                institution_code = result[0][0]
                logger.info(f"使用者 {user_id} 的機構代碼: {institution_code}")
                return institution_code
            else:
                logger.warning(f"找不到使用者 {user_id} 的機構代碼")
                return None
                
        except Exception as e:
            logger.error(f"查詢使用者機構代碼失敗: {e}")
            return None
    
    def generate_subject_code(self, user_id, verbose=0):
        """生成受試者代碼
        
        格式: P + 機構代碼(2碼) + 流水號(4碼)
        
        Args:
            user_id: 使用者ID
            verbose: 是否顯示詳細日誌
            
        Returns:
            受試者代碼 (7碼字串) 或 None
        """
        try:
            # 1. 獲取使用者機構代碼
            institution_code = self.get_user_institution_code(user_id, verbose)
            if not institution_code:
                logger.error(f"無法獲取使用者 {user_id} 的機構代碼")
                return None
            
            # 2. 查詢該機構的最大流水號
            self.connect()
            criteria = f"`subject_code` LIKE 'P{institution_code}%'"
            result = self.sql.search('subjects', ['subject_code'], criteria=criteria, verbose=verbose)
            
            max_serial = 0
            if result:
                for row in result:
                    subject_code = row[0]
                    if len(subject_code) == 7 and subject_code.startswith(f'P{institution_code}'):
                        try:
                            serial = int(subject_code[3:])  # 取後4碼
                            max_serial = max(max_serial, serial)
                        except ValueError:
                            continue
            
            # 3. 生成新的流水號
            new_serial = max_serial + 1
            subject_code = f"P{institution_code}{new_serial:04d}"
            
            logger.info(f"為使用者 {user_id} 生成受試者代碼: {subject_code}")
            return subject_code
            
        except Exception as e:
            logger.error(f"生成受試者代碼失敗: {e}")
            return None
    
    def get_dashboard_statistics(self, verbose=0):
        """獲取儀表板統計資料
        
        Args:
            verbose: 是否顯示詳細日誌
            
        Returns:
            統計資料字典
        """
        try:
            self.connect()
            stats = {}
            
            # 1. 獲取總 CRF 數量
            try:
                result = self.sql.search('subjects', ['COUNT(*) as count'], verbose=verbose)
                if result and result != "error occurs!":
                    stats['total_subjects'] = result[0][0] if result else 0
                else:
                    stats['total_subjects'] = 0
            except Exception as e:
                logger.error(f"獲取總 CRF 數量失敗: {e}")
                stats['total_subjects'] = 0
            
            # 2. 獲取待處理 Query 數量
            try:
                result = self.sql.search('queries', ['COUNT(*) as count'], criteria="`status`='pending'", verbose=verbose)
                if result and result != "error occurs!":
                    stats['pending_queries'] = result[0][0] if result else 0
                else:
                    stats['pending_queries'] = 0
            except Exception as e:
                logger.error(f"獲取待處理 Query 數量失敗: {e}")
                stats['pending_queries'] = 0
            
            # 3. 獲取已簽署 CRF 數量
            try:
                result = self.sql.search('subjects', ['COUNT(*) as count'], criteria="`status`='signed'", verbose=verbose)
                if result and result != "error occurs!":
                    stats['signed_crfs'] = result[0][0] if result else 0
                else:
                    stats['signed_crfs'] = 0
            except Exception as e:
                logger.error(f"獲取已簽署 CRF 數量失敗: {e}")
                stats['signed_crfs'] = 0
            
            # 4. 獲取使用者數量
            try:
                from function_sys.sqlconn import sqlconn
                import json
                
                with open(os.path.join(os.path.dirname(__file__), '..', 'login_sys', 'config.json'), 'r') as f:
                    config = json.load(f)
                
                united_sql = sqlconn(
                    host=config['sql_host'],
                    port=config['sql_port'],
                    user=config['sql_user'],
                    passwd=config['sql_passwd'],
                    dbname=config['sql_dbname']
                )
                
                result = united_sql.search('user', ['COUNT(*) as count'], verbose=verbose)
                if result and result != "error occurs!":
                    stats['active_users'] = result[0][0] if result else 0
                else:
                    stats['active_users'] = 0
                
                united_sql.dc()
            except Exception as e:
                logger.error(f"獲取使用者數量失敗: {e}")
                stats['active_users'] = 0
            
            return {
                'success': True,
                'data': stats
            }
            
        except Exception as e:
            logger.error(f"獲取儀表板統計資料失敗: {e}")
            return {
                'success': False,
                'message': f'獲取儀表板統計資料失敗: {str(e)}',
                'data': {
                    'total_subjects': 0,
                    'pending_queries': 0,
                    'signed_crfs': 0,
                    'active_users': 0
                }
            }
    
    def connect(self):
        self.sql=sqlconn(self.config['sql_host'],self.config['sql_port'],self.config['sql_user'],self.config['sql_passwd'],self.config['sql_dbname'])
    
    def disconnect(self):
        """關閉資料庫連接"""
        if hasattr(self, 'sql'):
            self.sql.dc()
    
    def __del__(self):
        """析構函數"""
        pass
    
    # ==================== Query 管理功能 ====================
    def create_query(self, subject_code, queries, created_by=None, verbose=0):
        """批量創建 Query
        
        Args:
            subject_code: 受試者編號
            queries: Query 列表
            created_by: 創建者
            verbose: 詳細模式
            
        Returns:
            創建結果字典
        """
        try:
            self.connect()
            
            if verbose:
                print(f"開始創建批量 Query: subject_code={subject_code}, queries_count={len(queries)}")
                print(f"Queries 資料: {queries}")
            
            # 檢查受試者是否存在
            existing_subject = self.sql.search('subjects', ['id'], criteria=f"`subject_code`='{subject_code}'")
            if not existing_subject:
                return {
                    'success': False,
                    'message': '受試者不存在',
                    'error_code': 'SUBJECT_NOT_FOUND'
                }
            
            # 生成批次ID
            import uuid
            batch_id = f"B{datetime.now().strftime('%Y%m%d%H%M%S')}{str(uuid.uuid4())[:8]}"
            
            # 準備批量資料
            batch_data = {
                'subject_code': subject_code,
                'queries': queries
            }
            
            # 插入到 queries 表
            columns = self.column_id['EDC']['column_id_queries']
            columns = [col for col in columns if col not in ['id', 'assigned_to', 'assigned_at', 'completed_at', 'due_date', 'notes', 'updated_at']]
            print("Columns: ", columns)
            values = [
                batch_id,
                subject_code,
                json.dumps(batch_data, ensure_ascii=False),
                str(len(queries)),
                'pending',
                created_by or 'system',
                datetime.now().strftime('%Y-%m-%d %H:%M:%S')
            ]
            if verbose:
                print(f"值: {values}")
                print(f"值數量: {len(values)}")
            
            query_id = self.sql.insert('queries', columns, values, verbose=verbose)
            
            if query_id:
                # 生成統一的 log_id
                unified_log_id = self._generate_log_id()
                if verbose:
                    print(f"Query log_id: {unified_log_id}")
                
                # 準備狀態更新資料
                additional_updates = {
                    'subjects': {'status': 'query', 'updated_by': created_by or 'system'},
                    'inclusion_criteria': {'status': 'query'},
                    'exclusion_criteria': {'status': 'query'}
                }
                
                # 準備變更記錄
                log_changes = [
                    {
                        'table_name': 'system',
                        'field_name': 'action',
                        'old_value': 'draft',
                        'new_value': 'query',
                        'action': 'QUERY'
                    }
                ]
                
                # 1. 先更新資料表狀態
                db_result = self.update_databases(
                    subject_code=subject_code,
                    user_id=created_by or 'system',
                    action_type='QUERY',
                    additional_updates=additional_updates,
                    log_id=unified_log_id,
                    verbose=verbose
                )
                
                if not db_result['success']:
                    return {
                        'success': False,
                        'message': f'Query 創建成功，但狀態更新失敗: {db_result["message"]}',
                        'error_code': 'STATUS_UPDATE_FAILED',
                        'query_id': query_id,
                        'batch_id': batch_id
                    }
                
                # 2. 再記錄日誌
                log_result = self.update_logs(
                    subject_code=subject_code,
                    user_id=created_by or 'system',
                    action_type='QUERY',
                    log_changes=log_changes,
                    log_id=unified_log_id,
                    verbose=verbose
                )
                
                if not log_result['success']:
                    if verbose:
                        print(f"Query 創建成功，狀態更新成功，但日誌記錄失敗: {log_result['message']}")
                
                return {
                    'success': True,
                    'message': f'成功創建 {len(queries)} 個 Query 並更新狀態為 query',
                    'created_count': len(queries),
                    'log_id': unified_log_id,
                    'data': {
                        'query_id': query_id,
                        'batch_id': batch_id,
                        'subject_code': subject_code,
                        'queries': queries,
                        'status_updated': True
                    }
                }
            else:
                return {
                    'success': False,
                    'message': '批量 Query 創建失敗',
                    'error_code': 'INSERT_FAILED'
                }
                
        except Exception as e:
            logger.error(f"批量創建 Query 失敗: {e}")
            return {
                'success': False,
                'message': f'批量創建失敗: {str(e)}',
                'error_code': 'DATABASE_ERROR'
            }
    
    def get_queries_by_subject(self, subject_code, verbose=0):
        """獲取受試者的 Query 列表
        
        Args:
            subject_code: 受試者編號
            verbose: 詳細模式
            
        Returns:
            Query 列表
        """
        try:
            self.connect()
            
            # 查詢該受試者的所有 Query
            result = self.sql.search('queries', ['*'], criteria=f"`subject_code`='{subject_code}'", order='`created_at` DESC', verbose=verbose)
            print(result)
            if result == "error occurs!":
                # 查詢失敗
                return {
                    'success': False,
                    'data': [],
                    'message': "查詢 Query 記錄時發生錯誤。"
                }
            elif result and len(result) > 0:
                # 查詢成功且有資料
                queries = []
                columns = self.column_id['EDC']['column_id_queries']
                
                for row in result:
                    query_data = {}
                    for idx, col in enumerate(columns):
                        # 特別處理 batch_data 欄位（假設名稱為 'batch_data'）
                        if col == 'batch_data':
                            query_data[col] = json.loads(row[idx]) if row[idx] else {}
                        elif col in ['created_at', 'updated_at', 'assigned_at', 'completed_at']:
                            # 格式化時間欄位為字串
                            if row[idx]:
                                if hasattr(row[idx], 'strftime'):
                                    query_data[col] = row[idx].strftime('%Y-%m-%d %H:%M:%S')
                                else:
                                    query_data[col] = str(row[idx])
                            else:
                                query_data[col] = None
                        else:
                            query_data[col] = row[idx]
                    queries.append(query_data)
                
                # 按時間排序（最新的在前）
                queries.sort(key=lambda x: x.get('created_at', ''), reverse=True)
                
                return {
                    'success': True,
                    'data': queries
                }
            else:
                return {
                    'success': True,
                    'data': [],
                    'message': "此受試者尚無 Query 記錄。"
                }
                
        except Exception as e:
            logger.error(f"獲取 Query 列表失敗: {e}")
            return {
                'success': False,
                'message': f'獲取失敗: {str(e)}',
                'error_code': 'DATABASE_ERROR'
            }
    
    def respond_to_query(self, batch_id, response_text, response_type, original_value=None, corrected_value=None, responded_by=None, verbose=0):
        """回應 Query
        
        Args:
            batch_id: 批次ID
            response_text: 回應內容
            response_type: 回應類型
            original_value: 原始值
            corrected_value: 修正值
            responded_by: 回應者
            verbose: 詳細模式
            
        Returns:
            回應結果字典
        """
        try:
            self.connect()
            
            # 檢查 Query 是否存在
            existing_query = self.sql.search('queries', ['*'], criteria=f"`batch_id`='{batch_id}'", verbose=verbose)
            if not existing_query:
                return {
                    'success': False,
                    'message': 'Query 不存在',
                    'error_code': 'QUERY_NOT_FOUND'
                }
            
            query_row = existing_query[0]
            batch_data = json.loads(query_row[3])
            
            # 根據回應類型處理不同的邏輯
            response_ids = []
            
            # 根據回應類型設定 Query 狀態
            # 映射前端按鈕類型到資料庫狀態
            type_mapping = {
                'no_action': 'accept',      # 接受
                'escalation': 'reject',     # 拒絕
                'correction': 'correct',    # 修正
                'clarification': 'explain', # 說明
                'completed': 'completed'    # 完成
            }
            
            query_status = type_mapping.get(response_type, 'accept')
            
            # 處理修正類型：需要更新受試者資料
            if response_type == 'correction' and corrected_value:
                self._update_subject_data_for_correction(batch_data, corrected_value, verbose)
            
            # 如果是試驗監測者回應，直接完成 Query
            if responded_by and 'monitor' in responded_by.lower():
                query_status = 'completed'
            
            # 為每個 Query 創建回應記錄
            for query in batch_data.get('queries', []):
                columns = ['batch_id', 'field_name', 'table_name', 'original_question', 'response_text', 
                            'response_type', 'original_value', 'corrected_value', 'status', 'responded_by', 'responded_at']
                values = [
                    batch_id,
                    query['field_name'],
                    query['table_name'],
                    query['question'],
                    response_text,
                    response_type,
                    original_value or '',
                    corrected_value or '',
                    'responded',
                    responded_by or 'system',
                    datetime.now().strftime('%Y-%m-%d %H:%M:%S')
                ]
                
                response_id = self.sql.insert('query_responses', columns, values, verbose=verbose)
                if response_id:
                    response_ids.append(response_id)
            
            # 更新 Query 狀態
            completed_at = datetime.now().strftime('%Y-%m-%d %H:%M:%S')
            updated_at = datetime.now().strftime('%Y-%m-%d %H:%M:%S')
            
            update_set = f"`status`='{query_status}', `completed_at`='{completed_at}', `updated_at`='{updated_at}'"

            
            self.sql.update('queries', update_set, f"`batch_id`='{batch_id}'", verbose=verbose)
            
            # 如果是 completed 狀態，檢查是否還有其他未完成的 Query
            if query_status == 'completed':
                self._check_and_update_subject_status_if_all_queries_completed(batch_id, responded_by, verbose)
            
            return {
                'success': True,
                'message': 'Query 回應成功',
                'data': {
                    'batch_id': batch_id,
                    'response_ids': response_ids,
                    'response_count': len(response_ids)
                }
            }
                
        except Exception as e:
            logger.error(f"回應 Query 失敗: {e}")
            return {
                'success': False,
                'message': f'回應失敗: {str(e)}',
                'error_code': 'DATABASE_ERROR'
            }
    
    def get_query_responses(self, batch_id, verbose=0):
        """獲取 Query 的回應記錄
        
        Args:
            batch_id: 批次ID
            verbose: 詳細模式
            
        Returns:
            回應結果字典
        """
        try:
            self.connect()
            
            # 查詢該 batch_id 的所有回應記錄
            responses = self.sql.search('query_responses', ['*'], 
                                     criteria=f"`batch_id`='{batch_id}'",
                                     order='`responded_at` ASC',
                                     verbose=verbose)
            
            if not responses:
                return {
                    'success': True,
                    'message': '無回應記錄',
                    'data': []
                }
            
            # 格式化回應資料
            formatted_responses = []
            for response in responses:
                # 格式化 responded_at 時間
                responded_at = response[11]
                if responded_at and hasattr(responded_at, 'strftime'):
                    responded_at = responded_at.strftime('%Y-%m-%d %H:%M:%S')
                
                formatted_responses.append({
                    'id': response[0],
                    'batch_id': response[1],
                    'field_name': response[2],
                    'table_name': response[3],
                    'original_question': response[4],
                    'response_text': response[5],
                    'response_type': response[6],
                    'original_value': response[7],
                    'corrected_value': response[8],
                    'status': response[9],
                    'responded_by': response[10],
                    'responded_at': responded_at,
                    'attachments': response[12] if len(response) > 12 else None
                })
            
            return {
                'success': True,
                'message': '獲取回應記錄成功',
                'data': formatted_responses
            }
                
        except Exception as e:
            logger.error(f"獲取 Query 回應記錄失敗: {e}")
            return {
                'success': False,
                'message': f'獲取回應記錄失敗: {str(e)}',
                'error_code': 'DATABASE_ERROR'
            }
    
    def _update_subject_data_for_correction(self, batch_data, corrected_value, verbose=0):
        """為修正類型的Query更新受試者資料
        
        Args:
            batch_data: Query批次資料
            corrected_value: 修正後的值
            verbose: 詳細模式
        """
        try:
            for query in batch_data.get('queries', []):
                table_name = query.get('table_name')
                field_name = query.get('field_name')
                
                if table_name and field_name:
                    # 更新對應的資料表
                    update_set = f"`{field_name}`='{corrected_value}'"
                    criteria = f"`subject_code`='{query.get('subject_code', '')}'"
                    
                    self.sql.update(table_name, update_set, criteria, verbose=verbose)
                    
                    if verbose:
                        print(f"已更新 {table_name}.{field_name} = {corrected_value}")
                        
        except Exception as e:
            logger.error(f"更新受試者資料失敗: {e}")
            raise e
    
    def _check_and_update_subject_status_if_all_queries_completed(self, batch_id, responded_by=None, verbose=0):
        """檢查受試者是否還有未完成的 Query，如果沒有則將狀態改回 draft
        
        Args:
            batch_id: Query 批次 ID
            responded_by: 回應者 ID
            verbose: 詳細模式
        """
        try:
            # 獲取該 Query 的受試者編號
            query_info = self.sql.search('queries', ['subject_code'], 
                                       criteria=f"`batch_id`='{batch_id}'", 
                                       verbose=verbose)
            
            if not query_info:
                if verbose:
                    print(f"找不到 batch_id {batch_id} 的 Query 記錄")
                return
                
            subject_code = query_info[0][0]
            
            # 檢查該受試者是否還有非 completed 狀態的 Query
            pending_queries = self.sql.search('queries', ['batch_id'], 
                                            criteria=f"`subject_code`='{subject_code}' AND `status` != 'completed'", 
                                            verbose=verbose)
            
            if not pending_queries:
                # 沒有未完成的 Query，將受試者狀態改回 draft
                # 先獲取當前狀態用於日誌記錄
                current_subject = self.sql.search('subjects', ['status'], 
                                                criteria=f"`subject_code`='{subject_code}'", 
                                                verbose=verbose)
                
                if current_subject:
                    old_status = current_subject[0][0]
                    
                    # 更新受試者狀態
                    self.sql.update('subjects', 
                                  "`status`='draft', `updated_at`=NOW()", 
                                  f"`subject_code`='{subject_code}'", 
                                  verbose=verbose)
                    
                    # 記錄變更日誌
                    if responded_by:
                        log_changes = [{
                            'table_name': 'subjects',
                            'field_name': 'status',
                            'old_value': old_status,
                            'new_value': 'draft',
                            'action': 'QUERY_COMPLETED'
                        }]
                        
                        # 使用 update_logs 記錄變更
                        self.update_logs(
                            subject_code=subject_code,
                            user_id=responded_by,
                            action_type='QUERY_COMPLETED',
                            log_changes=log_changes,
                            verbose=verbose
                        )
                    
                    if verbose:
                        print(f"受試者 {subject_code} 的所有 Query 已完成，狀態已改回 draft")
            else:
                if verbose:
                    print(f"受試者 {subject_code} 還有 {len(pending_queries)} 個未完成的 Query")
                    
        except Exception as e:
            logger.error(f"檢查受試者 Query 狀態失敗: {e}")
            # 不拋出異常，避免影響主要的 Query 回應流程
    
    # ==================== 輔助工具方法 ====================
    
    def get_cumulative_log_id(self, table_name, subject_code, new_log_id, verbose=0):
        """獲取累積式 log_id
        
        Args:
            table_name: 資料表名稱
            subject_code: 受試者編號
            new_log_id: 新的 log_id
            verbose: 詳細模式 (0/1)
            
        Returns:
            累積式的 log_id 字串
        """
        try:
            current_log_result = self.sql.search(table_name, ['log'], criteria=f"`subject_code`='{subject_code}'", verbose=verbose)
            if current_log_result and current_log_result[0][0]:
                current_log = current_log_result[0][0]
                return f"{current_log};{new_log_id}"
            else:
                return new_log_id
        except Exception as e:
            logger.warning(f"獲取累積式 log_id 失敗: {e}")
            return new_log_id
    
    # ==================== 上傳/插入受試者功能 ====================
    def insert_subject(self, subject_data, user_id, verbose=0, auto_commit=True):
        """插入新受試者資料
        
        Args:
            subject_data: 受試者資料字典
            user_id: 插入者ID
            verbose: 詳細模式 (0/1)
            auto_commit: 是否自動提交
            
        Returns:
            插入結果字典
        """
        try:
            # 重新連接資料庫
            self.connect()
            
            print(subject_data)
            
            # 1. 處理受試者代碼
            if not subject_data.get('subject_code'):
                # 如果沒有提供代碼，自動生成
                generated_code = self.generate_subject_code(user_id, verbose)
                if not generated_code:
                    return {
                        'success': False,
                        'message': '無法生成受試者代碼',
                        'error_code': 'CODE_GENERATION_FAILED'
                    }
                subject_data['subject_code'] = generated_code
                logger.info(f"自動生成受試者代碼: {generated_code}")
            else:
                # 如果前端已經提供了代碼，記錄但不再生成
                logger.info(f"使用前端提供的受試者代碼: {subject_data['subject_code']}")
            
            # 2. 驗證受試者編號唯一性
            result = self.sql.search('subjects', ['id'], criteria=f"`subject_code`='{subject_data['subject_code']}'", verbose=verbose)
            if result:
                return {
                    'success': False,
                    'message': '受試者編號已存在',
                    'error_code': 'DUPLICATE_SUBJECT_CODE'
                }
                
            # 2. 驗證資料完整性
            validation_result = self._validate_subject_data(subject_data)
            if not validation_result['valid']:
                return {
                    'success': False,
                    'message': validation_result['message'],
                    'error_code': 'VALIDATION_ERROR'
                }
            
            # 3. 設定插入者
            subject_data['created_by'] = user_id
            
            # 4. 插入資料庫
            columns = self.column_id['EDC']['column_id_subjects']
            exclude_fields = ['id', 'log', 'updated_by', 'updated_at', 'signed_at', 'signed_by']
            columns = [col for col in columns if col not in exclude_fields]
            values = []
            for col in columns:
                if col == 'imaging_files':
                    values.append(json.dumps(subject_data.get('imaging_files', [])))
                elif col == 'created_at':
                    values.append(datetime.now().strftime('%Y-%m-%d %H:%M:%S'))
                elif col == 'created_by':
                    values.append(str(subject_data.get('created_by', 'system')))
                elif col == 'status':
                    values.append(subject_data.get('status', 'draft'))
                elif col in ['bac', 'dm', 'gout']:
                    values.append(str(subject_data.get(col, 0)))
                else:
                    value = subject_data.get(col)
                    values.append(value)

            print("AAA", values)  
            if self.sql.insert('subjects', columns, values, verbose=verbose):
                # 獲取新插入的 ID
                result = self.sql.search('subjects', ['id'], criteria=f"`subject_code`='{subject_data['subject_code']}'", verbose=verbose)
                subject_id = result[0][0] if result else 0
            else:
                raise Exception("插入資料庫失敗")
            
            return {
                'success': True,
                'message': '受試者資料插入成功',
                'subject_id': subject_id,
                'subject_code': subject_data['subject_code']
            }
            
        except Exception as e:
            logger.error(f"插入受試者資料失敗: {e}")
            return {
                'success': False,
                'message': f'插入失敗: {str(e)}',
                'error_code': 'DATABASE_ERROR'
            }
    
    def insert_inclusion_criteria(self, subject_result, inclusion_data, user_id, verbose=0, auto_commit=True):
        """插入納入條件評估資料
        
        Args:
            subject_result: 受試者插入結果
            inclusion_data: 納入條件資料字典
            user_id: 插入者ID
            verbose: 詳細模式 (0/1)
            auto_commit: 是否自動提交
            
        Returns:
            插入結果字典
        """
        try:
            self.connect()
            
            # 1. 檢查受試者是否存在
            if not subject_result or not subject_result.get('success'):
                return {
                    'success': False,
                    'message': '受試者資料不存在',
                    'error_code': 'SUBJECT_NOT_FOUND'
                }
            
            # 2. 設定關聯和插入者
            inclusion_data['subject_code'] = subject_result['subject_code']
            inclusion_data['created_by'] = user_id
            
            # 3. 插入資料庫
            columns = self.column_id['EDC']['column_id_inclusion_criteria']
            exclude_fields = ['id', 'log', 'updated_by', 'updated_at', 'signed_at', 'signed_by']
            columns = [col for col in columns if col not in exclude_fields]
            values = []
            now_str = datetime.now().strftime('%Y-%m-%d %H:%M:%S')
            for col in columns:
                if col == 'medications':
                    values.append(json.dumps(inclusion_data.get('medications', [])))
                elif col == 'surgeries':
                    values.append(json.dumps(inclusion_data.get('surgeries', [])))
                elif col == 'created_at':
                    values.append(now_str)
                elif col == 'status':
                    values.append(inclusion_data.get('status', 'draft'))
                else:
                    if col in ['subject_code', 'created_by']:
                        values.append(str(inclusion_data[col]))
                    else:
                        value = inclusion_data.get(col, 0)
                        values.append(value)
            
            if self.sql.insert('inclusion_criteria', columns, values, verbose=verbose):
                # 獲取新插入的 ID
                result = self.sql.search('inclusion_criteria', ['id'], criteria=f"`subject_code`='{inclusion_data['subject_code']}'", verbose=verbose)
                inclusion_id = result[0][0] if result else 0
            else:
                raise Exception("插入納入條件失敗")
            
            return {
                'success': True,
                'message': '納入條件評估資料插入成功',
                'inclusion_id': inclusion_id,
                'subject_code': inclusion_data['subject_code']
            }
            
        except Exception as e:
            logger.error(f"插入納入條件資料失敗: {e}")
            return {
                'success': False,
                'message': f'插入失敗: {str(e)}',
                'error_code': 'DATABASE_ERROR'
            }
    
    def insert_exclusion_criteria(self, subject_code, exclusion_data, user_id, verbose=0, auto_commit=True):
        """插入排除條件評估資料
        
        Args:
            subject_code: 受試者編號
            exclusion_data: 排除條件資料字典
            user_id: 插入者ID
            verbose: 詳細模式 (0/1)
            auto_commit: 是否自動提交
            
        Returns:
            插入結果字典
        """
        try:
            # 重新連接資料庫
            self.connect()
            
            # 1. 檢查受試者是否存在
            if not self.sql.search('subjects', ['id'], criteria=f"`subject_code`='{subject_code}'", verbose=verbose):
                return {
                    'success': False,
                    'message': '受試者不存在',
                    'error_code': 'SUBJECT_NOT_FOUND'
                }
            
            # 2. 設定關聯和插入者
            exclusion_data['subject_code'] = subject_code
            exclusion_data['created_by'] = user_id
            
            # 3. 插入資料庫
            columns = self.column_id['EDC']['column_id_exclusion_criteria']
            exclude_fields = ['id', 'log', 'updated_by', 'updated_at', 'signed_at', 'signed_by']
            columns = [col for col in columns if col not in exclude_fields]
            values = []
            for col in columns:
                if col == 'created_at':
                    values.append(datetime.now().strftime('%Y-%m-%d %H:%M:%S'))
                elif col == 'status':
                    values.append(exclusion_data.get('status', 'draft'))
                else:
                    if col == 'subject_code':
                        values.append(str(exclusion_data['subject_code']))
                    elif col == 'created_by':
                        values.append(str(exclusion_data['created_by']))
                    elif col == 'judgment_reason':
                        value = exclusion_data.get(col, '')
                        values.append(str(value) if value is not None else '')
                    else:
                        value = exclusion_data.get(col, 0)
                        values.append(value)
            
            if self.sql.insert('exclusion_criteria', columns, values, verbose=verbose):
                # 獲取新插入的 ID
                result = self.sql.search('exclusion_criteria', ['id'], criteria=f"`subject_code`='{exclusion_data['subject_code']}'", verbose=verbose)
                exclusion_id = result[0][0] if result else 0
            else:
                raise Exception("插入排除條件失敗")
            
            return {
                'success': True,
                'message': '排除條件評估資料插入成功',
                'exclusion_id': exclusion_id,
                'subject_code': exclusion_data['subject_code']
            }
            
        except Exception as e:
            logger.error(f"插入排除條件資料失敗: {e}")
            return {
                'success': False,
                'message': f'插入失敗: {str(e)}',
                'error_code': 'DATABASE_ERROR'
            }
    
    def update_subject(self, subject_id, subject_data, user_id, log_id=None, verbose=0):
        """更新受試者資料
        
        Args:
            subject_id: 受試者ID
            subject_data: 受試者資料字典
            user_id: 更新者ID
            
        Returns:
            更新結果字典
        """
        try:
            # 重新連接資料庫
            self.connect()
            
            # 1. 檢查受試者是否存在
            existing_subject_result = self.sql.search('subjects', ['*'], criteria=f"`id`={subject_id}")
            if not existing_subject_result:
                return {
                    'success': False,
                    'message': '受試者不存在',
                    'error_code': 'SUBJECT_NOT_FOUND'
                }
            
            # 將查詢結果轉換為字典格式
            all_columns = self.column_id['EDC']['column_id_subjects']
            existing_subject = dict(zip(all_columns, existing_subject_result[0]))
            
            # 2. 驗證資料
            validation_result = self._validate_subject_data(subject_data)
            if not validation_result['valid']:
                return {
                    'success': False,
                    'message': validation_result['message'],
                    'error_code': 'VALIDATION_ERROR'
                }
            
            # 3. 設定更新者
            subject_data['updated_by'] = user_id
            
            # 5. 準備變更記錄
            log_changes = []
            for field, new_value in subject_data.items():
                if field not in ['id', 'subject_code', 'created_by', 'created_at', 'log', 'status', 'updated_by']:
                    old_value = existing_subject.get(field, '')
                    if str(old_value) != str(new_value):
                        log_changes.append({
                            'table_name': 'subjects',
                            'field_name': field,
                            'old_value': str(old_value),
                            'new_value': str(new_value),
                            'action': 'UPDATE'
                        })
            
            # 6. 準備額外的資料表更新
            additional_updates = {}
            if log_changes:  # 只有當有實際變更時才更新資料表
                all_columns = self.column_id['EDC']['column_id_subjects']
                exclude_fields = ['id', 'subject_code', 'created_by', 'created_at', 'log', 'status', 'signed_by', 'signed_at']
                update_columns = [col for col in all_columns if col not in exclude_fields]
                
                subjects_update = {}
                for col in update_columns:
                    if col == 'imaging_files':
                        value = json.dumps(subject_data.get('imaging_files', []))
                        subjects_update[col] = value
                    elif col == 'updated_by':
                        subjects_update[col] = user_id
                    elif col in ['bac', 'dm', 'gout']:
                        subjects_update[col] = subject_data.get(col, 0)
                    else:
                        value = subject_data.get(col, '')
                        subjects_update[col] = str(value) if value is not None else ''
                
                additional_updates = {
                    'subjects': subjects_update
                }
            
            # 7. 更新資料表
            if additional_updates:
                db_result = self.update_databases(
                    subject_code=subject_data['subject_code'],
                    user_id=user_id,
                    action_type='UPDATE',
                    additional_updates=additional_updates,
                    log_id=log_id,
                    verbose=verbose
                )
                
                if not db_result['success']:
                    return db_result
                
                return {
                    'success': True,
                    'message': '受試者資料更新成功',
                    'subject_id': subject_id,
                    'log_id': db_result.get('log_id'),
                    'updated_tables': db_result.get('updated_tables', [])
                }
            else:
                return {
                    'success': True,
                    'message': '受試者資料更新成功（無變更）',
                    'subject_id': subject_id
                }
                
        except Exception as e:
            logger.error(f"更新受試者失敗: {e}")
            return {
                'success': False,
                'message': f'更新失敗: {str(e)}',
                'error_code': 'DATABASE_ERROR'
            }
    
    def update_inclusion_criteria(self, subject_code, inclusion_data, user_id, log_id=None, verbose=0):
        """更新納入條件評估資料
        
        Args:
            subject_code: 受試者編號
            inclusion_data: 納入條件資料字典
            user_id: 更新者ID
            verbose: 詳細模式 (0/1)
            
        Returns:
            更新結果字典
        """
        try:
            self.connect()
            
            # 1. 檢查受試者是否存在
            existing_subject = self.sql.search('subjects', ['id'], criteria=f"`subject_code`='{subject_code}'")
            if not existing_subject:
                return {
                    'success': False,
                    'message': '受試者不存在',
                    'error_code': 'SUBJECT_NOT_FOUND'
                }
            
            # 2. 檢查納入條件記錄是否存在
            existing_inclusion = self.sql.search('inclusion_criteria', ['id'], criteria=f"`subject_code`='{subject_code}'")
            if not existing_inclusion:
                return {
                    'success': False,
                    'message': '納入條件記錄不存在',
                    'error_code': 'INCLUSION_NOT_FOUND'
                }
            
            # 3. 設定更新者
            inclusion_data['updated_by'] = user_id
            
            # 4. 準備變更記錄
            log_changes = []
            
            # 獲取現有的納入條件資料
            existing_inclusion_result = self.sql.search('inclusion_criteria', ['*'], criteria=f"`subject_code`='{subject_code}'")
            if existing_inclusion_result:
                all_columns = self.column_id['EDC']['column_id_inclusion_criteria']
                existing_inclusion = dict(zip(all_columns, existing_inclusion_result[0]))
                
                # 比較每個欄位的變更
                for field, new_value in inclusion_data.items():
                    if field not in ['id', 'subject_code', 'created_by', 'created_at', 'log', 'status', 'signed_by', 'signed_at', 'updated_by']:
                        old_value = existing_inclusion.get(field, '')
                        if str(old_value) != str(new_value):
                            log_changes.append({
                                'table_name': 'inclusion_criteria',
                                'field_name': field,
                                'old_value': str(old_value),
                                'new_value': str(new_value),
                                'action': 'UPDATE'
                            })
            
            # 5. 準備額外的資料表更新
            all_columns = self.column_id['EDC']['column_id_inclusion_criteria']
            exclude_fields = ['id', 'subject_code', 'created_by', 'created_at', 'log', 'status', 'signed_by', 'signed_at']
            update_columns = [col for col in all_columns if col not in exclude_fields]
            
            inclusion_update = {}
            for col in update_columns:
                if col == 'medications':
                    value = json.dumps(inclusion_data.get('medications', []))
                    inclusion_update[col] = value
                elif col == 'surgeries':
                    value = json.dumps(inclusion_data.get('surgeries', []))
                    inclusion_update[col] = value
                elif col == 'updated_by':
                    inclusion_update[col] = user_id
                else:
                    # 大部分欄位都是數值型，預設為 0
                    value = inclusion_data.get(col, 0)
                    inclusion_update[col] = str(value) if value is not None else '0'
            
            additional_updates = {
                'inclusion_criteria': inclusion_update
            }
            
            # 6. 更新資料表
            if additional_updates:
                db_result = self.update_databases(
                    subject_code=subject_code,
                    user_id=user_id,
                    action_type='UPDATE',
                    additional_updates=additional_updates,
                    log_id=log_id,
                    verbose=verbose
                )
                
                if not db_result['success']:
                    return db_result
                
                return {
                    'success': True,
                    'message': '納入條件評估資料更新成功',
                    'subject_code': subject_code,
                    'log_id': db_result.get('log_id'),
                    'updated_tables': db_result.get('updated_tables', [])
                }
            else:
                return {
                    'success': True,
                    'message': '納入條件評估資料更新成功（無變更）',
                    'subject_code': subject_code
                }
                
        except Exception as e:
            logger.error(f"更新納入條件資料失敗: {e}")
            return {
                'success': False,
                'message': f'更新失敗: {str(e)}',
                'error_code': 'DATABASE_ERROR'
            }
    
    def update_exclusion_criteria(self, subject_code, exclusion_data, user_id, log_id=None, verbose=0):
        """更新排除條件評估資料
        
        Args:
            subject_code: 受試者編號
            exclusion_data: 排除條件資料字典
            user_id: 更新者ID
            verbose: 詳細模式 (0/1)
            
        Returns:
            更新結果字典
        """
        try:
            self.connect()
            
            # 1. 檢查受試者是否存在
            existing_subject = self.sql.search('subjects', ['id'], criteria=f"`subject_code`='{subject_code}'")
            if not existing_subject:
                return {
                    'success': False,
                    'message': '受試者不存在',
                    'error_code': 'SUBJECT_NOT_FOUND'
                }
            
            # 2. 檢查排除條件記錄是否存在
            existing_exclusion = self.sql.search('exclusion_criteria', ['id'], criteria=f"`subject_code`='{subject_code}'")
            if not existing_exclusion:
                return {
                    'success': False,
                    'message': '排除條件記錄不存在',
                    'error_code': 'EXCLUSION_NOT_FOUND'
                }
            
            # 3. 設定更新者
            exclusion_data['updated_by'] = user_id
            
            # 4. 準備變更記錄
            log_changes = []
            
            # 獲取現有的排除條件資料
            existing_exclusion_result = self.sql.search('exclusion_criteria', ['*'], criteria=f"`subject_code`='{subject_code}'")
            if existing_exclusion_result:
                all_columns = self.column_id['EDC']['column_id_exclusion_criteria']
                existing_exclusion = dict(zip(all_columns, existing_exclusion_result[0]))
                
                # 比較每個欄位的變更
                for field, new_value in exclusion_data.items():
                    if field not in ['id', 'subject_code', 'created_by', 'created_at', 'log', 'status', 'signed_by', 'signed_at', 'updated_by']:
                        old_value = existing_exclusion.get(field, '')
                        if str(old_value) != str(new_value):
                            log_changes.append({
                                'table_name': 'exclusion_criteria',
                                'field_name': field,
                                'old_value': str(old_value),
                                'new_value': str(new_value),
                                'action': 'UPDATE'
                            })
            
            # 5. 準備額外的資料表更新
            all_columns = self.column_id['EDC']['column_id_exclusion_criteria']
            exclude_fields = ['id', 'subject_code', 'created_by', 'created_at', 'log', 'status', 'signed_by', 'signed_at']
            update_columns = [col for col in all_columns if col not in exclude_fields]
            
            exclusion_update = {}
            for col in update_columns:
                if col == 'updated_by':
                    exclusion_update[col] = user_id
                elif col == 'judgment_reason':
                    # 文字欄位，預設空字串
                    value = exclusion_data.get(col, '')
                    exclusion_update[col] = str(value) if value is not None else ''
                else:
                    # 大部分欄位都是數值型，預設為 0
                    value = exclusion_data.get(col, 0)
                    exclusion_update[col] = str(value) if value is not None else '0'
            
            additional_updates = {
                'exclusion_criteria': exclusion_update
            }
            
            # 6. 更新資料表
            if additional_updates:
                db_result = self.update_databases(
                    subject_code=subject_code,
                    user_id=user_id,
                    action_type='UPDATE',
                    additional_updates=additional_updates,
                    log_id=log_id,
                    verbose=verbose
                )
                
                if not db_result['success']:
                    return db_result
                
                return {
                    'success': True,
                    'message': '排除條件評估資料更新成功',
                    'subject_code': subject_code,
                    'log_id': db_result.get('log_id'),
                    'updated_tables': db_result.get('updated_tables', [])
                }
            else:
                return {
                    'success': True,
                    'message': '排除條件評估資料更新成功（無變更）',
                    'subject_code': subject_code
                }
                
        except Exception as e:
            logger.error(f"更新排除條件資料失敗: {e}")
            return {
                'success': False,
                'message': f'更新失敗: {str(e)}',
                'error_code': 'DATABASE_ERROR'
            }
    
    def get_subject(self, subject_id):
        """獲取受試者完整資料
        
        Args:
            subject_id: 受試者ID
            
        Returns:
            受試者資料字典
        """
        try:
            # 重新連接資料庫
            self.connect()
            
            # 獲取受試者基本資料
            subject = self.sql.search('subjects', ['*'], criteria=f"`id`={subject_id}")
            if not subject:
                return {}
            
            # 獲取納入條件
            inclusion = self.sql.search('inclusion_criteria', ['*'], criteria=f"`subject_id`={subject_id}")
            
            # 獲取排除條件
            exclusion = self.sql.search('exclusion_criteria', ['*'], criteria=f"`subject_id`={subject_id}")
            
            return {
                'subject': subject[0] if subject else {},
                'inclusion_criteria': inclusion[0] if inclusion else {},
                'exclusion_criteria': exclusion[0] if exclusion else {}
            }
        except Exception as e:
            logger.error(f"獲取受試者資料失敗: {e}")
            return {}
    
    # ==================== 資格評估功能 ====================
    
    def evaluate_eligibility(self, subject_id):
        """評估受試者資格
        
        Args:
            subject_id: 受試者ID
            
        Returns:
            資格評估結果字典
        """
        try:
            # 1. 獲取完整資料
            complete_data = self.get_subject(subject_id)
            if not complete_data:
                return {
                    'success': False,
                    'message': '受試者資料不存在',
                    'error_code': 'SUBJECT_NOT_FOUND'
                }
            
            # 2. 評估納入條件
            inclusion_score = self._evaluate_inclusion_criteria(complete_data.get('inclusion_criteria', {}))
            
            # 3. 評估排除條件
            exclusion_score = self._evaluate_exclusion_criteria(complete_data.get('exclusion_criteria', {}))
            
            # 4. 計算總體資格
            overall_eligibility = self._calculate_overall_eligibility(inclusion_score, exclusion_score)
            
            return {
                'success': True,
                'subject_id': subject_id,
                'inclusion_score': inclusion_score,
                'exclusion_score': exclusion_score,
                'overall_eligibility': overall_eligibility,
                'details': {
                    'inclusion_criteria': complete_data.get('inclusion_criteria'),
                    'exclusion_criteria': complete_data.get('exclusion_criteria')
                }
            }
            
        except Exception as e:
            logger.error(f"資格評估失敗: {e}")
            return {
                'success': False,
                'message': f'評估失敗: {str(e)}',
                'error_code': 'EVALUATION_ERROR'
            }
    
    # ==================== 工具函數 ====================
    
    def _validate_subject_data(self, data):
        """驗證受試者資料完整性
        
        Args:
            data: 受試者資料字典
            
        Returns:
            驗證結果字典
        """
        errors = []
        print("data: ", data)
        
        # 必填欄位檢查
        required_fields = ['subject_code'] # , 'date_of_birth', 'gender'
        for field in required_fields:
            if not data.get(field):
                errors.append(f'缺少必填欄位: {field}')
        
        # # 日期格式驗證
        # date_fields = [
        #     ('date_of_birth', '出生日期'),
        #     ('enroll_date', '個案納入日期'),
        #     ('biochem_date', '生化檢驗採檢日期'),
        #     ('urine_date', '尿液檢驗採檢日期'),
        #     ('urinalysis_date', '尿液鏡檢採檢日期'),
        #     ('imaging_date', '影像檢查日期')
        # ]
        
        # for field, label in date_fields:
        #     try:
        #         if data.get(field):
        #             datetime.strptime(data[field], '%Y-%m-%d')
        #     except ValueError:
        #         errors.append(f'{label}格式錯誤')
        
        # # 數值範圍驗證
        # try:
        #     if data.get('height_cm'):
        #         height = float(data['height_cm'])
        #         if height < 50 or height > 300:
        #             errors.append('身高數值異常 (應在 50-300 cm 之間)')
        # except (ValueError, TypeError):
        #     errors.append('身高數值格式錯誤')
        
        # try:
        #     if data.get('weight_kg'):
        #         weight = float(data['weight_kg'])
        #         if weight < 20 or weight > 500:
        #             errors.append('體重數值異常 (應在 20-500 kg 之間)')
        # except (ValueError, TypeError):
        #     errors.append('體重數值格式錯誤')
        
        # # 年齡驗證
        # try:
        #     if data.get('age'):
        #         age = int(data['age'])
        #         if age < 0 or age > 150:
        #             errors.append('年齡數值異常 (應在 0-150 歲之間)')
        # except (ValueError, TypeError):
        #     errors.append('年齡數值格式錯誤')
        
        # # BMI 驗證
        # try:
        #     if data.get('bmi'):
        #         bmi = float(data['bmi'])
        #         if bmi < 10 or bmi > 100:
        #             errors.append('BMI 數值異常 (應在 10-100 之間)')
        # except (ValueError, TypeError):
        #     errors.append('BMI 數值格式錯誤')
        
        # 性別驗證
        try:
            if data.get('gender') is not None:
                gender = int(data['gender'])
                if gender not in [0, 1]:
                    errors.append('性別數值異常 (應為 0 或 1)')
        except (ValueError, TypeError):
            errors.append('性別數值格式錯誤')
        
        # 病史相關欄位驗證 (bac, dm, gout)
        for field_name, field_label in [('bac', '菌尿症'), ('dm', '糖尿病'), ('gout', '痛風')]:
            try:
                if data.get(field_name) is not None:
                    value = int(data[field_name])
                    if value not in [0, 1]:
                        errors.append(f'{field_label}數值異常 (應為 0 或 1)')
            except (ValueError, TypeError):
                errors.append(f'{field_label}數值格式錯誤')
        
        # # 檢驗數值欄位驗證
        # try:
        #     if data.get('scr') is not None:
        #         scr = float(data['scr'])
        #         if scr < 0 or scr > 50:
        #             errors.append('血清肌酸酐數值異常 (應在 0-50 mg/dL 之間)')
        # except (ValueError, TypeError):
        #     if data.get('scr'):  # 只有當有值時才報錯
        #         errors.append('血清肌酸酐數值格式錯誤')
        
        # try:
        #     if data.get('egfr') is not None:
        #         egfr = float(data['egfr'])
        #         if egfr < 0 or egfr > 200:
        #             errors.append('估算腎絲球過濾率數值異常 (應在 0-200 mL/min/1.73m² 之間)')
        # except (ValueError, TypeError):
        #     if data.get('egfr'):  # 只有當有值時才報錯
        #         errors.append('估算腎絲球過濾率數值格式錯誤')
        
        # try:
        #     if data.get('ph') is not None:
        #         ph = float(data['ph'])
        #         if ph < 4.0 or ph > 10.0:
        #             errors.append('尿液酸鹼值異常 (應在 4.0-10.0 之間)')
        # except (ValueError, TypeError):
        #     if data.get('ph'):  # 只有當有值時才報錯
        #         errors.append('尿液酸鹼值格式錯誤')
        
        # try:
        #     if data.get('sg') is not None:
        #         sg = float(data['sg'])
        #         if sg < 1.000 or sg > 1.050:
        #             errors.append('尿液比重異常 (應在 1.000-1.050 之間)')
        # except (ValueError, TypeError):
        #     if data.get('sg'):  # 只有當有值時才報錯
        #         errors.append('尿液比重格式錯誤')
        
        # try:
        #     if data.get('rbc') is not None:
        #         rbc = int(data['rbc'])
        #         if rbc < 0 or rbc > 1000:
        #             errors.append('尿液紅血球計數異常 (應在 0-1000 /HPF 之間)')
        # except (ValueError, TypeError):
        #     if data.get('rbc'):  # 只有當有值時才報錯
        #         errors.append('尿液紅血球計數格式錯誤')
        
        # 受試者編號格式驗證
        if data.get('subject_code'):
            import re
            if not re.match(r'^P[A-Za-z0-9]{2}-?[A-Za-z0-9]{4}$', data['subject_code']):
                errors.append('受試者編號格式錯誤 (應為 P+2碼機構代碼+4碼流水號，例：P01-0001)')
        
        print({
            'valid': len(errors) == 0,
            'message': '; '.join(errors) if errors else '驗證通過'
        })
        return {
            'valid': len(errors) == 0,
            'message': '; '.join(errors) if errors else '驗證通過'
        }
    
    def _evaluate_inclusion_criteria(self, inclusion_data):
        """評估納入條件分數
        
        Args:
            inclusion_data: 納入條件資料字典
            
        Returns:
            評估分數字典
        """
        if not inclusion_data:
            return {'score': 0, 'total': 0, 'percentage': 0, 'eligible': False}
        
        criteria_fields = [
            'age_18_above', 'gender_available', 'age_available', 'bmi_available',
            'egfr_available', 'urine_ph_available', 'urine_sg_available',
            'urine_rbc_available', 'bacteriuria_available', 'lab_interval_7days',
            'imaging_available', 'kidney_structure_visible', 'mid_ureter_visible',
            'lower_ureter_visible', 'imaging_lab_interval_7days', 'no_treatment_during_exam'
        ]
        
        score = 0
        total = len(criteria_fields)
        
        for field in criteria_fields:
            if inclusion_data.get(field) == 1:
                score += 1
        
        percentage = (score / total) * 100 if total > 0 else 0
        eligible = percentage >= 80  # 80% 以上為合格
        
        return {
            'score': score,
            'total': total,
            'percentage': round(percentage, 2),
            'eligible': eligible
        }
    
    def _evaluate_exclusion_criteria(self, exclusion_data):
        """評估排除條件分數
        
        Args:
            exclusion_data: 排除條件資料字典
            
        Returns:
            評估分數字典
        """
        if not exclusion_data:
            return {'score': 0, 'total': 0, 'percentage': 0, 'eligible': True}
        
        criteria_fields = [
            'pregnant_female', 'kidney_transplant', 'urinary_tract_foreign_body',
            'non_stone_urological_disease', 'renal_replacement_therapy',
            'medical_record_incomplete', 'major_blood_immune_cancer',
            'rare_metabolic_disease', 'investigator_judgment'
        ]
        
        score = 0
        total = len(criteria_fields)
        
        for field in criteria_fields:
            if exclusion_data.get(field) == 0:  # 0 表示無排除條件
                score += 1
        
        percentage = (score / total) * 100 if total > 0 else 0
        eligible = percentage >= 90  # 90% 以上為合格
        
        return {
            'score': score,
            'total': total,
            'percentage': round(percentage, 2),
            'eligible': eligible
        }
    
    def _calculate_overall_eligibility(self, inclusion_score, exclusion_score):
        """計算總體資格評估結果
        
        Args:
            inclusion_score: 納入條件分數字典
            exclusion_score: 排除條件分數字典
            
        Returns:
            總體資格結果字串
        """
        if inclusion_score['eligible'] and exclusion_score['eligible']:
            return 'Eligible'
        elif inclusion_score['eligible'] and not exclusion_score['eligible']:
            return 'Exclusion Criteria Failed'
        elif not inclusion_score['eligible'] and exclusion_score['eligible']:
            return 'Inclusion Criteria Failed'
        else:
            return 'Not Eligible'
    
    # ==================== 事務性插入功能 ====================
    
    def insert_subject_with_criteria(self, subject_data, inclusion_data, exclusion_data, user_id, verbose=0):
        """事務性插入受試者資料、納入條件和排除條件
        
        Args:
            subject_data: 受試者資料字典
            inclusion_data: 納入條件資料字典
            exclusion_data: 排除條件資料字典
            user_id: 插入者ID
            verbose: 詳細模式 (0/1)
            
        Returns:
            插入結果字典
        """
        try:
            # 重新連接資料庫
            self.connect()
            
            # 開始事務
            self.sql.execute("START TRANSACTION")
            
            # 1. 插入受試者資料（事務模式，不自動提交）
            subject_result = self.insert_subject(subject_data, user_id, verbose, auto_commit=False)
            if not subject_result['success']:
                # 回滾事務
                self.sql.execute("ROLLBACK")
                return subject_result
            
            # 2. 插入納入條件（事務模式，不自動提交）
            inclusion_result = self.insert_inclusion_criteria(subject_result, inclusion_data, user_id, verbose, auto_commit=False)
            if not inclusion_result['success']:
                # 回滾事務
                self.sql.execute("ROLLBACK")
                return inclusion_result
            
            # 3. 插入排除條件（事務模式，不自動提交）
            exclusion_result = self.insert_exclusion_criteria(subject_result['subject_code'], exclusion_data, user_id, verbose, auto_commit=False)
            if not exclusion_result['success']:
                # 回滾事務
                self.sql.execute("ROLLBACK")
                return exclusion_result
            
            # 所有插入都成功，提交事務
            self.sql.execute("COMMIT")
            
            return {
                'success': True,
                'message': '受試者資料、納入條件和排除條件全部插入成功',
                'subject_code': subject_result['subject_code'],
                'subject_id': subject_result['subject_id'],
                'inclusion_id': inclusion_result['inclusion_id'],
                'exclusion_id': exclusion_result['exclusion_id']
            }
            
        except Exception as e:
            # 發生異常，回滾事務
            try:
                self.sql.execute("ROLLBACK")
            except:
                pass  # 忽略回滾失敗的錯誤
            
            logger.error(f"事務性插入失敗: {e}")
            return {
                'success': False,
                'message': f'事務性插入失敗: {str(e)}',
                'error_code': 'TRANSACTION_ERROR'
            }

    def update_subject_with_criteria(self, subject_code, subject_data, inclusion_data, exclusion_data, user_id, edit_log_data=None, verbose=False):
        """事務性更新受試者資料、納入條件和排除條件
        
        Args:
            subject_code: 受試者編號
            subject_data: 受試者資料字典
            inclusion_data: 納入條件資料字典
            exclusion_data: 排除條件資料字典
            user_id: 更新者ID
            verbose: 詳細模式 (0/1)
            edit_log_data: 編輯日誌資料
            
        Returns:
            更新結果字典
        """
        try:
            # 重新連接資料庫
            self.connect()
            
            # 開始事務
            self.sql.execute("START TRANSACTION")
            
            # 0. 生成統一的 log_id
            unified_log_id = self._generate_log_id()
            print(f"2. log_id: {unified_log_id}")
            
            # 1. 獲取受試者ID
            subject_result = self.sql.search('subjects', ['id'], criteria=f"`subject_code`='{subject_code}'")
            if not subject_result:
                self.sql.execute("ROLLBACK")
                return {
                    'success': False,
                    'message': '受試者不存在',
                    'error_code': 'SUBJECT_NOT_FOUND'
                }
            subject_id = subject_result[0][0]
            
            # 2. 更新受試者資料
            subject_update_result = self.update_subject(subject_id, subject_data, user_id, log_id=unified_log_id, verbose=verbose)
            if not subject_update_result['success']:
                # 回滾事務
                self.sql.execute("ROLLBACK")
                return subject_update_result
            
            # 3. 更新納入條件
            inclusion_update_result = self.update_inclusion_criteria(subject_code, inclusion_data, user_id, log_id=unified_log_id, verbose=verbose)
            if not inclusion_update_result['success']:
                # 回滾事務
                self.sql.execute("ROLLBACK")
                return inclusion_update_result
                
            # 4. 更新排除條件
            exclusion_update_result = self.update_exclusion_criteria(subject_code, exclusion_data, user_id, log_id=unified_log_id, verbose=verbose)
            if not exclusion_update_result['success']:
                # 回滾事務
                self.sql.execute("ROLLBACK")
                return exclusion_update_result
            
            # 5. 統一記錄日誌（使用統一的 log_id）
            print("edit_log_data received: ", edit_log_data)
            if edit_log_data and edit_log_data.get('changes'):
                changes = edit_log_data.get('changes', [])
                print("changes length: ", len(changes))
                
                # 確保所有 changes 都使用統一的 log_id
                for change in changes:
                    change['log_id'] = unified_log_id
                
                # 使用統一日誌更新函數
                log_result = self.update_logs(
                    subject_code=subject_code,
                    user_id=user_id,
                    action_type='UPDATE',
                    log_changes=changes,
                    log_id=unified_log_id,  # 使用統一的 log_id
                    verbose=verbose
                )
                
                if not log_result['success']:
                    self.sql.execute("ROLLBACK")
                    return log_result
                    
                print(f"日誌更新成功，log_id: {unified_log_id}")
            else:
                print("No edit_log_data or no changes found")
                print("edit_log_data type: ", type(edit_log_data))
                if edit_log_data:
                    print("edit_log_data keys: ", edit_log_data.keys())
            
            # 所有更新都成功，提交事務
            self.sql.execute("COMMIT")
            
            return {
                'success': True,
                'message': '受試者資料、納入條件和排除條件全部更新成功',
                'subject_code': subject_code,
                'subject_id': subject_id
            }
            
        except Exception as e:
            # 發生異常，回滾事務
            try:
                self.sql.execute("ROLLBACK")
            except:
                pass  # 忽略回滾失敗的錯誤
            
            logger.error(f"事務性更新失敗: {e}")
            return {
                'success': False,
                'message': f'事務性更新失敗: {str(e)}',
                'error_code': 'TRANSACTION_ERROR'
            }

    def get_subject_by_id(self, subject_id, verbose=0):
        """根據 ID 獲取受試者資料
        
        Args:
            subject_id: 受試者ID
            verbose: 詳細模式 (0/1)
            
        Returns:
            受試者資料字典或 None
        """
        try:
            self.connect()
            result = self.sql.search('subjects', ['*'], criteria=f"`id`={subject_id}", verbose=verbose)
            if result:
                return self._format_subject_data(result[0])
            return None
        except Exception as e:
            logger.error(f"Error getting subject by ID: {e}")
            return None
    
    def get_subject_by_code(self, subject_code, verbose=0):
        """根據受試者編號獲取受試者資料
        
        Args:
            subject_code: 受試者編號
            verbose: 詳細模式 (0/1)
            
        Returns:
            受試者資料字典或 None
        """
        try:
            self.connect()
            result = self.sql.search('subjects', ['*'], criteria=f"`subject_code`='{subject_code}'", verbose=verbose)
            if result:
                return self._format_subject_data(result[0])
            return None
        except Exception as e:
            logger.error(f"Error getting subject by code: {e}")
            return None
    
    def get_subject_detail_by_code(self, subject_code, verbose=0):
        """根據受試者編號獲取受試者完整詳細資料（包含納入和排除條件）
        
        Args:
            subject_code: 受試者編號 (字串)
            verbose: 詳細模式 (0/1)
            
        Returns:
            包含完整資料的字典或 None
        """
        try:
            self.connect()
            
            # 1. 獲取基本受試者資料
            subject_result = self.sql.search('subjects', ['*'], criteria=f"`subject_code`='{subject_code}'", verbose=verbose)
            if not subject_result:
                return None
            
            subject_data = self._format_subject_data(subject_result[0])
            
            # 2. 獲取納入條件資料
            inclusion_result = self.sql.search('inclusion_criteria', ['*'], criteria=f"`subject_code`='{subject_code}'", verbose=verbose)
            inclusion_data = None
            if inclusion_result:
                inclusion_data = self._format_inclusion_criteria_data(inclusion_result[0])
            
            # 3. 獲取排除條件資料
            exclusion_result = self.sql.search('exclusion_criteria', ['*'], criteria=f"`subject_code`='{subject_code}'", verbose=verbose)
            exclusion_data = None
            if exclusion_result:
                exclusion_data = self._format_exclusion_criteria_data(exclusion_result[0])
            
            # 4. 組合完整資料
            complete_data = {
                'subject': subject_data,
                'inclusion_criteria': inclusion_data,
                'exclusion_criteria': exclusion_data
            }
            
            return complete_data
            
        except Exception as e:
            logger.error(f"Error getting subject detail by code: {e}")
            return None
    
    def search_subjects(self, user_id, filters=None, page=1, page_size=5, sort_field='id', sort_direction='DESC', verbose=0):
        """搜尋受試者資料（支援分頁和排序）
        
        Args:
            user_id: 當前使用者ID
            filters: 篩選條件字典
            page: 頁碼 (從1開始)
            page_size: 每頁記錄數
            sort_field: 排序欄位
            sort_direction: 排序方向 ('ASC' 或 'DESC')
            verbose: 詳細模式 (0/1)
            
        Returns:
            搜尋結果字典，包含資料和分頁資訊
        """
        try:
            self.connect()
            
            # 構建查詢條件
            # criteria = f"`created_by` = '{user_id}'"
            criteria = "1=1"
            print("filters: ", filters)
            if filters:
                try:
                    if filters.get('subject_code') is not None:
                        criteria += f" AND `subject_code` LIKE '%{str(filters['subject_code'])}%'"
                    if filters.get('risk_score') is not None:
                        criteria += f" AND `risk_score` = {str(filters['risk_score'])}"
                    if filters.get('gender') is not None:
                        criteria += f" AND `gender` = {str(filters['gender'])}"
                    if filters.get('age_min') is not None:
                        criteria += f" AND `age` >= {str(filters['age_min'])}"
                    if filters.get('age_max') is not None:
                        criteria += f" AND `age` <= {str(filters['age_max'])}"
                    if filters.get('bmi_min') is not None:
                        criteria += f" AND `bmi` >= {str(filters['bmi_min'])}"
                    if filters.get('bmi_max') is not None:
                        criteria += f" AND `bmi` <= {str(filters['bmi_max'])}"
                    if filters.get('scr_min') is not None:
                        criteria += f" AND `scr` >= {str(filters['scr_min'])}"
                    if filters.get('scr_max') is not None:
                        criteria += f" AND `scr` <= {str(filters['scr_max'])}"
                    if filters.get('egfr_min') is not None:
                        criteria += f" AND `egfr` >= {str(filters['egfr_min'])}"
                    if filters.get('egfr_max') is not None:
                        criteria += f" AND `egfr` <= {str(filters['egfr_max'])}"
                    if filters.get('imaging_type') is not None:
                        criteria += f" AND `imaging_type` = '{str(filters['imaging_type'])}'"
                    if filters.get('kidney_stone_diagnosis') is not None:
                        criteria += f" AND `kidney_stone_diagnosis` = {str(filters['kidney_stone_diagnosis'])}"
                    if filters.get('date_from') is not None:
                        criteria += f" AND `created_at` >= '{str(filters['date_from'])}'"
                    if filters.get('date_to') is not None:
                        criteria += f" AND `created_at` <= '{str(filters['date_to'])} 23:59:59'"
                    if filters.get('dm') is not None:
                        criteria += f" AND `dm` = {str(filters['dm'])}"
                    if filters.get('gout') is not None:
                        criteria += f" AND `gout` = {str(filters['gout'])}"
                    if filters.get('bac') is not None:
                        criteria += f" AND `bac` = {str(filters['bac'])}"
                    if filters.get('status') is not None:
                        criteria += f" AND `status` = '{str(filters['status'])}'"
                except (ValueError, TypeError) as e:
                    logger.error(f"篩選條件轉換失敗: {e}")
                    # 如果轉換失敗，跳過有問題的篩選條件
                    pass
            
            print("criteria: ", criteria)
            # 計算總記錄數
            total_result = self.sql.search('subjects', ['COUNT(*) as total'], criteria=criteria, verbose=verbose)
            total_records = total_result[0][0] if total_result else 0
            
            # 計算分頁
            total_pages = (total_records + page_size - 1) // page_size
            offset = (page - 1) * page_size
            
            # 執行分頁查詢
            order_clause = f"`{sort_field}` {sort_direction}"
            print(order_clause)
            result = self.sql.search('subjects', ['*'], criteria=criteria, order=order_clause, verbose=verbose)
            
            if result and result != "error occurs!":
                start_idx = offset
                end_idx = offset + page_size
                result = result[start_idx:end_idx]
            
            # 格式化資料
            subjects = []
            if result == "error occurs!":
                # 查詢失敗
                return {
                    'success': False,
                    'message': '搜尋受試者資料時發生錯誤',
                    'data': [],
                    'pagination': {
                        'current_page': page,
                        'page_size': page_size,
                        'total_records': 0,
                        'total_pages': 0
                    }
                }
            elif result and len(result) > 0:
                # 查詢成功且有資料
                for row in result:
                    try:
                        subject_data = self._format_subject_data(row)
                        if subject_data and isinstance(subject_data, dict):
                            subject_data['inclusion_criteria'] = self._get_inclusion_criteria(subject_data.get('subject_code', ''))
                            subject_data['exclusion_criteria'] = self._get_exclusion_criteria(subject_data.get('subject_code', ''))
                            subjects.append(subject_data)
                    except Exception as e:
                        logger.error(f"格式化受試者資料失敗: {e}")
                        continue
            
            return {
                'success': True,
                'data': subjects,
                'pagination': {
                    'current_page': page,
                    'page_size': page_size,
                    'total_records': total_records,
                    'total_pages': total_pages
                }
            }
            
        except Exception as e:
            import traceback
            logger.error(f"Error searching subjects: {e}")
            logger.error(f"Full traceback: {traceback.format_exc()}")
            return {
                'success': False,
                'message': f'搜尋失敗: {str(e)}',
                'data': [],
                'pagination': {
                    'current_page': page,
                    'page_size': page_size,
                    'total_records': 0,
                    'total_pages': 0
                }
            }
    
    def get_subject_statistics(self, verbose=0):
        """獲取受試者統計資料
        
        Args:
            verbose: 詳細模式 (0/1)
            
        Returns:
            統計資料字典
        """
        try:
            self.connect()
            
            # 總受試者數
            total_result = self.sql.search('subjects', ['COUNT(*) as total'], verbose=verbose)
            total_subjects = total_result[0][0] if total_result else 0
            
            # 性別統計
            male_result = self.sql.search('subjects', ['*'], criteria='gender=1', verbose=verbose)
            female_result = self.sql.search('subjects', ['*'], criteria='gender=0', verbose=verbose)
            gender_stats = {
                '男': len(male_result) if male_result else 0,
                '女': len(female_result) if female_result else 0
            }
            
            # 年齡統計 - 按年齡範圍分組
            age_ranges = {
                '0-20歲': 'age >= 0 AND age <= 20',
                '21-40歲': 'age >= 21 AND age <= 40',
                '41-60歲': 'age >= 41 AND age <= 60',
                '61-80歲': 'age >= 61 AND age <= 80',
                '80歲以上': 'age > 80'
            }
            age_stats = {}
            for range_name, criteria in age_ranges.items():
                result = self.sql.search('subjects', ['*'], criteria=criteria, verbose=verbose)
                age_stats[range_name] = len(result) if result else 0
            
            # BMI 統計 - 按 BMI 範圍分組
            bmi_ranges = {
                '偏瘦(<18.5)': 'bmi < 18.5',
                '正常(18.5-24.9)': 'bmi >= 18.5 AND bmi <= 24.9',
                '過重(25-29.9)': 'bmi >= 25 AND bmi <= 29.9',
                '肥胖(≥30)': 'bmi >= 30'
            }
            bmi_stats = {}
            for range_name, criteria in bmi_ranges.items():
                result = self.sql.search('subjects', ['*'], criteria=criteria, verbose=verbose)
                bmi_stats[range_name] = len(result) if result else 0
            
            # 影像檢查類型統計
            ct_result = self.sql.search('subjects', ['*'], criteria="imaging_type='CT'", verbose=verbose)
            pet_ct_result = self.sql.search('subjects', ['*'], criteria="imaging_type='PET-CT'", verbose=verbose)
            no_imaging_result = self.sql.search('subjects', ['*'], criteria="imaging_type IS NULL OR imaging_type=''", verbose=verbose)
            
            imaging_stats = {
                'CT': len(ct_result) if ct_result else 0,
                'PET-CT': len(pet_ct_result) if pet_ct_result else 0,
                '未指定': len(no_imaging_result) if no_imaging_result else 0
            }
            
            # 腎結石診斷統計
            stone_yes_result = self.sql.search('subjects', ['*'], criteria='kidney_stone_diagnosis=1', verbose=verbose)
            stone_no_result = self.sql.search('subjects', ['*'], criteria='kidney_stone_diagnosis=0', verbose=verbose)
            stone_unknown_result = self.sql.search('subjects', ['*'], criteria='kidney_stone_diagnosis IS NULL', verbose=verbose)
            
            stone_stats = {
                '是': len(stone_yes_result) if stone_yes_result else 0,
                '否': len(stone_no_result) if stone_no_result else 0,
                '未知': len(stone_unknown_result) if stone_unknown_result else 0
            }
            
            return {
                'success': True,
                'total_subjects': total_subjects,
                'gender_distribution': gender_stats,
                'age_distribution': age_stats,
                'bmi_distribution': bmi_stats,
                'imaging_type_distribution': imaging_stats,
                'kidney_stone_diagnosis_distribution': stone_stats
            }
            
        except Exception as e:
            logger.error(f"Error getting statistics: {e}")
            return {
                'success': False,
                'message': f'獲取統計資料失敗: {str(e)}'
            }
    
    def export_subjects_data(self, filters=None, format='csv', verbose=0):
        """匯出受試者資料
        
        Args:
            filters: 篩選條件字典
            format: 匯出格式 ('csv', 'json', 'excel')
            verbose: 詳細模式 (0/1)
            
        Returns:
            匯出結果字典
        """
        try:
            self.connect()
            
            # 構建查詢條件
            criteria = "1=1"
            if filters:
                if filters.get('subject_code'):
                    criteria += f" AND `subject_code` LIKE '%{filters['subject_code']}%'"
                if filters.get('gender') is not None:
                    criteria += f" AND `gender` = {str(filters['gender'])}"
                if filters.get('age_min') is not None:
                    criteria += f" AND `age` >= {str(filters['age_min'])}"
                if filters.get('age_max') is not None:
                    criteria += f" AND `age` <= {str(filters['age_max'])}"
                if filters.get('imaging_type'):
                    criteria += f" AND `imaging_type` = '{filters['imaging_type']}'"
                if filters.get('date_from'):
                    criteria += f" AND `created_at` >= '{filters['date_from']}'"
                if filters.get('date_to'):
                    criteria += f" AND `created_at` <= '{filters['date_to']}'"
            
            # 查詢所有符合條件的資料
            result = self.sql.search('subjects', ['*'], criteria=criteria, verbose=verbose)
            
            if not result:
                return {
                    'success': False,
                    'message': '沒有找到符合條件的資料'
                }
            
            # 格式化資料
            subjects = []
            for row in result:
                subject_data = self._format_subject_data(row)
                # 獲取納入條件和排除條件
                subject_data['inclusion_criteria'] = self._get_inclusion_criteria(subject_data['subject_code'])
                subject_data['exclusion_criteria'] = self._get_exclusion_criteria(subject_data['subject_code'])
                subjects.append(subject_data)
            
            # 根據格式處理資料
            if format == 'json':
                export_data = json.dumps(subjects, ensure_ascii=False, indent=2)
                content_type = 'application/json'
                filename = f'subjects_export_{datetime.now().strftime("%Y%m%d_%H%M%S")}.json'
            elif format == 'csv':
                export_data = self._convert_to_csv(subjects)
                content_type = 'text/csv'
                filename = f'subjects_export_{datetime.now().strftime("%Y%m%d_%H%M%S")}.csv'
            else:
                return {
                    'success': False,
                    'message': f'不支援的匯出格式: {format}'
                }
            
            return {
                'success': True,
                'data': export_data,
                'content_type': content_type,
                'filename': filename,
                'record_count': len(subjects)
            }
            
        except Exception as e:
            logger.error(f"Error exporting data: {e}")
            return {
                'success': False,
                'message': f'匯出失敗: {str(e)}'
            }
    
    def _get_inclusion_criteria(self, subject_code):
        """獲取納入條件資料
        
        Args:
            subject_code: 受試者編號
            
        Returns:
            納入條件資料字典或 None
        """
        try:
            if not subject_code:
                return None
            result = self.sql.search('inclusion_criteria', ['*'], criteria=f"`subject_code`='{subject_code}'", verbose=0)
            if result and result != "error occurs!" and len(result) > 0:
                return self._format_inclusion_criteria_data(result[0])
            return None
        except Exception as e:
            logger.error(f"獲取納入條件失敗: {e}")
            return None
    
    def _get_exclusion_criteria(self, subject_code):
        """獲取排除條件資料
        
        Args:
            subject_code: 受試者編號
            
        Returns:
            排除條件資料字典或 None
        """
        try:
            if not subject_code:
                return None
            result = self.sql.search('exclusion_criteria', ['*'], criteria=f"`subject_code`='{subject_code}'", verbose=0)
            if result and result != "error occurs!" and len(result) > 0:
                return self._format_exclusion_criteria_data(result[0])
            return None
        except Exception as e:
            logger.error(f"獲取排除條件失敗: {e}")
            return None
    
    def _convert_to_csv(self, data):
        """將資料轉換為 CSV 格式
        
        Args:
            data: 資料列表
            
        Returns:
            CSV 字串
        """
        if not data:
            return ""
        
        # 獲取所有欄位
        fields = set()
        for item in data:
            fields.update(item.keys())
        
        # 排序欄位
        field_order = [
            'subject_code', 'date_of_birth', 'age', 'gender', 'height_cm', 'weight_kg', 'bmi',
            'bac', 'dm', 'gout', 'imaging_type', 'imaging_date', 'kidney_stone_diagnosis',
            'created_at', 'created_by'
        ]
        
        # 添加其他欄位
        for field in sorted(fields):
            if field not in field_order:
                field_order.append(field)
        
        # 生成 CSV
        csv_lines = []
        csv_lines.append(','.join(field_order))
        
        for item in data:
            row = []
            for field in field_order:
                value = item.get(field, '')
                if isinstance(value, (dict, list)):
                    value = json.dumps(value, ensure_ascii=False)
                row.append(str(value))
            csv_lines.append(','.join(row))
        
        return '\n'.join(csv_lines)

    def _format_subject_data(self, row):
        """格式化受試者資料
        
        Args:
            row: 從資料庫查詢出來的原始資料行
            
        Returns:
            格式化後的受試者資料字典
        """
        try:
            # 將資料庫查詢結果轉換為字典格式
            if isinstance(row, (list, tuple)):
                # 如果是元組或列表，需要根據欄位順序轉換
                # 根據 subjects 表的欄位順序
                columns = self.column_id['EDC']['column_id_subjects']
                
                subject_data = {}
                for i, col in enumerate(columns):
                    if i < len(row):
                        subject_data[col] = row[i]
                    else:
                        subject_data[col] = None
            else:
                # 如果已經是字典格式，直接使用
                subject_data = dict(row) if hasattr(row, '__iter__') else row
            
            # 格式化性別顯示
            if 'gender' in subject_data:
                subject_data['gender_display'] = '男' if subject_data['gender'] == 1 else '女'
            
            # 格式化布林值欄位
            boolean_fields = ['bac', 'dm', 'gout', 'kidney_stone_diagnosis']
            for field in boolean_fields:
                if field in subject_data:
                    subject_data[f'{field}_display'] = '是' if subject_data[field] == 1 else '否'
            
            # 格式化新增的檢驗數值欄位
            lab_fields = ['scr', 'egfr', 'ph', 'sg', 'rbc']
            for field in lab_fields:
                if field in subject_data and subject_data[field] is not None:
                    if field in ['scr', 'egfr']:
                        subject_data[f'{field}_formatted'] = f"{subject_data[field]:.2f}"
                    elif field in ['ph', 'sg']:
                        subject_data[f'{field}_formatted'] = f"{subject_data[field]:.1f}"
                    else:
                        subject_data[f'{field}_formatted'] = str(subject_data[field])
            
            # 格式化影像檢查類型
            if 'imaging_type' in subject_data:
                subject_data['imaging_type_display'] = subject_data['imaging_type'] or '未指定'
            
            # 格式化日期欄位
            date_fields = ['date_of_birth', 'imaging_date', 'enroll_date', 'biochem_date', 'urine_date', 'urinalysis_date', 'created_at', 'updated_at']
            for field in date_fields:
                if field in subject_data and subject_data[field]:
                    # 如果日期是字串格式，嘗試格式化
                    if isinstance(subject_data[field], str):
                        try:
                            # 嘗試解析日期並格式化
                            from datetime import datetime
                            date_obj = datetime.strptime(subject_data[field], '%Y-%m-%d %H:%M:%S')
                            subject_data[f'{field}_formatted'] = date_obj.strftime('%Y-%m-%d %H:%M:%S')
                        except:
                            subject_data[f'{field}_formatted'] = subject_data[field]
                    else:
                        subject_data[f'{field}_formatted'] = str(subject_data[field])
            
            # 格式化數值欄位
            numeric_fields = ['age', 'height_cm', 'weight_kg', 'bmi']
            for field in numeric_fields:
                if field in subject_data and subject_data[field] is not None:
                    if field == 'bmi':
                        subject_data[f'{field}_formatted'] = f"{subject_data[field]:.2f}"
                    elif field in ['height_cm', 'weight_kg']:
                        subject_data[f'{field}_formatted'] = f"{subject_data[field]:.1f}"
                    else:
                        subject_data[f'{field}_formatted'] = str(subject_data[field])
            
            return subject_data
            
        except Exception as e:
            logger.error(f"格式化受試者資料失敗: {e}")
            # 如果格式化失敗，返回原始資料
            return row if hasattr(row, '__iter__') else {'error': '格式化失敗', 'raw_data': str(row)}

    def _format_inclusion_criteria_data(self, row):
        """格式化納入條件資料
        
        Args:
            row: 資料庫查詢結果行
            
        Returns:
            格式化後的納入條件資料字典
        """
        try:
            # 根據資料庫欄位順序映射
            field_names = self.column_id['EDC']['column_id_inclusion_criteria']
            
            formatted_data = {}
            for i, field_name in enumerate(field_names):
                if i < len(row):
                    value = row[i]
                    # 處理特殊欄位
                    if field_name in ['medications', 'surgeries'] and value:
                        try:
                            formatted_data[field_name] = json.loads(value) if value != '[]' else []
                        except:
                            formatted_data[field_name] = []
                    else:
                        formatted_data[field_name] = value
                else:
                    formatted_data[field_name] = None
            
            return formatted_data
            
        except Exception as e:
            logger.error(f"Error formatting inclusion criteria data: {e}")
            return {}
    
    def _format_exclusion_criteria_data(self, row):
        """格式化排除條件資料
        
        Args:
            row: 資料庫查詢結果行
            
        Returns:
            格式化後的排除條件資料字典
        """
        try:
            # 根據資料庫欄位順序映射
            field_names = self.column_id['EDC']['column_id_exclusion_criteria']
            
            formatted_data = {}
            for i, field_name in enumerate(field_names):
                if i < len(row):
                    value = row[i]
                    formatted_data[field_name] = value
                else:
                    formatted_data[field_name] = None
            
            return formatted_data
            
        except Exception as e:
            logger.error(f"Error formatting exclusion criteria data: {e}")
            return {}

    def get_subject_history(self, subject_code, verbose=0):
        """獲取受試者的歷程記錄
        
        Args:
            subject_code: 受試者編號
            verbose: 詳細模式
            
        Returns:
            歷程記錄列表
        """
        try:
            self.connect()
            
            columns = self.column_id['EDC'].get('column_id_edit_log', [])
            criteria = f"`subject_code`='{subject_code}'"
            results = self.sql.search('edit_log', columns, criteria=criteria, verbose=verbose)
            
            if not results or results == "error occurs!":
                return []
            
            history = []
            for row in results:
                record = {}
                for i, column in enumerate(columns):
                    if i < len(row):
                        value = row[i]
                        # 處理日期時間欄位
                        if column == 'created_at' and value:
                            try:
                                if hasattr(value, 'strftime'):
                                    record[column] = value.strftime('%Y-%m-%d %H:%M:%S')
                                else:
                                    # 如果已經是字串，直接使用
                                    record[column] = str(value)
                            except:
                                record[column] = str(value) if value else ''
                        else:
                            record[column] = value
                    else:
                        record[column] = None
                
                history.append(record)
            
            # 按時間排序（最新的在前）
            history.sort(key=lambda x: x.get('created_at', ''), reverse=True)
            
            return history
            
        except Exception as e:
            logger.error(f"Error getting subject history: {e}")
            return {
                "success": False,
                "message": f"取得受試者歷程記錄時發生錯誤: {e}",
                "data": []
            }

    def submit_for_review(self, subject_code, user_id, verbose=0):
        """提交受試者資料供審核
        
        Args:
            subject_code: 受試者編號
            user_id: 提交者ID
            verbose: 詳細模式 (0/1)
            
        Returns:
            提交結果字典
        """
        try:
            # 重新連接資料庫
            self.connect()
            
            # 開始事務
            self.sql.execute("START TRANSACTION")
            
            # 檢查受試者是否存在
            subject_result = self.sql.search('subjects', ['id', 'status'], criteria=f"`subject_code`='{subject_code}'")
            if not subject_result:
                self.sql.execute("ROLLBACK")
                return {
                    'success': False,
                    'message': '受試者不存在',
                    'error_code': 'SUBJECT_NOT_FOUND'
                }
            
            subject_id, current_status = subject_result[0]
            
            # 檢查當前狀態是否允許提交
            if current_status is None:
                self.sql.execute("ROLLBACK")
                return {
                    'success': False,
                    'message': '受試者尚未編輯，無法提交審核',
                    'error_code': 'NOT_EDITED'
                }
            if current_status != 'draft':
                self.sql.execute("ROLLBACK")
                return {
                    'success': False,
                    'message': f'受試者狀態為 {current_status}，無法提交審核',
                    'error_code': 'INVALID_STATUS'
                }
            
            log_changes = [
                {
                    'table_name': 'system',
                    'field_name': 'status',
                    'old_value': 'draft',
                    'new_value': 'submitted',
                    'action': 'SUBMIT'
                }
            ]
            additional_updates = {
                'subjects': {'status': 'submitted', 'updated_by': user_id},
                'inclusion_criteria': {'status': 'submitted'},
                'exclusion_criteria': {'status': 'submitted'}
            }
            # 1. 先更新資料表
            db_result = self.update_databases(
                subject_code=subject_code,
                user_id=user_id,
                action_type='SUBMIT',
                additional_updates=additional_updates,
                verbose=verbose
            )
            
            if not db_result['success']:
                self.sql.execute("ROLLBACK")
                return db_result
            
            # 2. 再記錄日誌
            log_result = self.update_logs(
                subject_code=subject_code,
                user_id=user_id,
                action_type='SUBMIT',
                log_changes=log_changes,
                log_id=db_result.get('log_id'),
                verbose=verbose
            )
            
            if not log_result['success']:
                self.sql.execute("ROLLBACK")
                return log_result
            
            # 提交事務
            self.sql.execute("COMMIT")
            
            return {
                'success': True,
                'message': '已成功提交審核，等待試驗主持人簽署',
                'subject_code': subject_code,
                'subject_id': subject_id,
                'status': 'submitted',
                'submitted_at': log_result['timestamp'],
                'submitted_by': user_id,
                'log_id': log_result['log_id']
            }
            
        except Exception as e:
            # 發生異常，回滾事務
            try:
                self.sql.execute("ROLLBACK")
            except:
                pass  # 忽略回滾失敗的錯誤
            
            logger.error(f"提交審核失敗: {e}")
            return {
                'success': False,
                'message': f'提交審核失敗: {str(e)}',
                'error_code': 'SUBMIT_ERROR'
            }
    
    def _execute_sign_subject(self, subject_code, user_id, verbose=0):
        """執行簽署受試者資料的核心邏輯（私有方法）
        
        Args:
            subject_code: 受試者編號
            user_id: 簽署者ID（必須是試驗主持人）
            verbose: 詳細模式 (0/1)
            
        Returns:
            簽署結果字典
        """
        try:
            # 重新連接資料庫
            self.connect()
            
            # 開始事務
            self.sql.execute("START TRANSACTION")
            
            # 檢查受試者是否存在
            subject_result = self.sql.search('subjects', ['id', 'status'], criteria=f"`subject_code`='{subject_code}'")
            if not subject_result:
                self.sql.execute("ROLLBACK")
                return {
                    'success': False,
                    'message': '受試者不存在',
                    'error_code': 'SUBJECT_NOT_FOUND'
                }
            
            subject_id, current_status = subject_result[0]
            
            # 檢查當前狀態是否允許簽署（必須是 submitted 狀態）
            if current_status != 'submitted':
                self.sql.execute("ROLLBACK")
                return {
                    'success': False,
                    'message': f'受試者狀態為 {current_status}，無法進行簽署',
                    'error_code': 'INVALID_STATUS'
                }
            
            # 獲取當前時間戳
            from datetime import datetime
            timestamp = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
            # 記錄操作日誌
            log_id = self._generate_log_id()
            print("3. log_id: ", log_id)
            
            # 在更新前先獲取當前數據，以便記錄編輯歷史
            tables_data = {}
            tables = ['subjects', 'inclusion_criteria', 'exclusion_criteria']
            
            for table in tables:
                # 只獲取需要記錄的字段
                fields_to_check = ['status', 'signed_by', 'signed_at']
                current_data = self.sql.search(table, fields_to_check, criteria=f"`subject_code`='{subject_code}'")
                if current_data:
                    # 將數據轉換為字典格式
                    tables_data[table] = dict(zip(fields_to_check, current_data[0]))
            
            log_changes = [
                {
                    'table_name': 'system',
                    'field_name': 'action',
                    'old_value': 'submitted',
                    'new_value': 'signed',
                    'action': 'SIGN'
                }
            ]
            
            additional_updates = {
                'subjects': {
                    'status': 'signed', 
                    'signed_by': user_id, 
                    'signed_at': timestamp,
                    'updated_by': user_id
                },
                'inclusion_criteria': {
                    'status': 'signed', 
                    'signed_by': user_id, 
                    'signed_at': timestamp,
                    'updated_by': user_id
                },
                'exclusion_criteria': {
                    'status': 'signed', 
                    'signed_by': user_id, 
                    'signed_at': timestamp,
                    'updated_by': user_id
                }
            }
            
            # 1. 先更新資料表
            db_result = self.update_databases(
                subject_code=subject_code,
                user_id=user_id,
                action_type='SIGN',
                additional_updates=additional_updates,
                verbose=verbose
            )
            
            if not db_result['success']:
                self.sql.execute("ROLLBACK")
                return db_result
            
            # 2. 再記錄日誌
            log_result = self.update_logs(
                subject_code=subject_code,
                user_id=user_id,
                action_type='SIGN',
                log_changes=log_changes,
                log_id=db_result.get('log_id'),
                verbose=verbose
            )
            
            if not log_result['success']:
                self.sql.execute("ROLLBACK")
                return log_result
            
            # 提交事務
            self.sql.execute("COMMIT")
            
            return {
                'success': True,
                'message': '已成功簽署受試者資料',
                'subject_code': subject_code,
                'subject_id': subject_id,
                'status': 'signed',
                'signed_at': timestamp,
                'signed_by': user_id
            }
            
        except Exception as e:
            # 發生異常，回滾事務
            try:
                self.sql.execute("ROLLBACK")
            except:
                pass  # 忽略回滾失敗的錯誤
            
            logger.error(f"簽署失敗: {e}")
            return {
                'success': False,
                'message': f'簽署失敗: {str(e)}',
                'error_code': 'SIGN_ERROR'
            }
    
    def _execute_submit_and_sign(self, subject_code, user_id, verbose=0):
        """執行提交審核並簽署的核心邏輯（私有方法）
        
        Args:
            subject_code: 受試者編號
            user_id: 提交並簽署者ID（必須是試驗主持人）
            verbose: 詳細模式 (0/1)
            
        Returns:
            操作結果字典
        """
        try:
            # 先驗證必填欄位
            validation_result = self.validate_required_fields(subject_code, verbose=verbose)
            if not validation_result['success']:
                return {
                    'success': False,
                    'message': validation_result['message'],
                    'missing_fields': validation_result.get('missing_fields', []),
                    'error_code': 'VALIDATION_FAILED'
                }
            
            # 重新連接資料庫
            self.connect()
            
            # 開始事務
            self.sql.execute("START TRANSACTION")
            
            # 檢查受試者是否存在且狀態為 draft
            subject_result = self.sql.search('subjects', ['id', 'status'], criteria=f"`subject_code`='{subject_code}'")
            if not subject_result:
                self.sql.execute("ROLLBACK")
                return {
                    'success': False,
                    'message': '受試者不存在',
                    'error_code': 'SUBJECT_NOT_FOUND'
                }
            
            subject_id, current_status = subject_result[0]
            
            if current_status != 'draft':
                self.sql.execute("ROLLBACK")
                return {
                    'success': False,
                    'message': f'受試者狀態為 {current_status}，無法進行提交並簽署',
                    'error_code': 'INVALID_STATUS'
                }
            
            # 獲取當前時間戳
            from datetime import datetime
            timestamp = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
            # 記錄操作日誌
            log_id = self._generate_log_id()
            print("4. log_id: ", log_id)
            
            # 在更新前先獲取當前數據，以便記錄編輯歷史
            tables_data = {}
            tables = ['subjects', 'inclusion_criteria', 'exclusion_criteria']
            
            for table in tables:
                # 只獲取需要記錄的字段
                fields_to_check = ['status', 'signed_by', 'signed_at']
                current_data = self.sql.search(table, fields_to_check, criteria=f"`subject_code`='{subject_code}'")
                if current_data:
                    # 將數據轉換為字典格式
                    tables_data[table] = dict(zip(fields_to_check, current_data[0]))
            
            log_changes = [
                {
                    'table_name': 'system',
                    'field_name': 'action',
                    'old_value': 'draft',
                    'new_value': 'signed',
                    'action': 'SIGN'
                }
            ]
            additional_updates = {
                'subjects': {
                    'status': 'signed', 
                    'signed_by': user_id, 
                    'signed_at': timestamp,
                    'updated_by': user_id
                },
                'inclusion_criteria': {
                    'status': 'signed', 
                    'signed_by': user_id, 
                    'signed_at': timestamp,
                    'updated_by': user_id
                },
                'exclusion_criteria': {
                    'status': 'signed', 
                    'signed_by': user_id, 
                    'signed_at': timestamp,
                    'updated_by': user_id
                }
            }
            
            # 1. 先更新資料表
            db_result = self.update_databases(
                subject_code=subject_code,
                user_id=user_id,
                action_type='SIGN',
                additional_updates=additional_updates,
                log_id=log_id,
                verbose=verbose
            )
            
            if not db_result['success']:
                self.sql.execute("ROLLBACK")
                return db_result
            
            # 2. 再記錄日誌
            log_result = self.update_logs(
                subject_code=subject_code,
                user_id=user_id,
                action_type='SIGN',
                log_changes=log_changes,
                log_id=log_id,
                verbose=verbose
            )
            
            if not log_result['success']:
                self.sql.execute("ROLLBACK")
                return log_result
            
            # 提交事務
            self.sql.execute("COMMIT")
            
            return {
                'success': True,
                'message': '已成功提交審核並簽署受試者資料',
                'subject_code': subject_code,
                'subject_id': subject_id,
                'status': 'signed',
                'signed_at': timestamp,
                'signed_by': user_id
            }
            
        except Exception as e:
            # 發生異常，回滾事務
            try:
                self.sql.execute("ROLLBACK")
            except:
                pass  # 忽略回滾失敗的錯誤
            
            logger.error(f"提交並簽署失敗: {e}")
            return {
                'success': False,
                'message': f'提交並簽署失敗: {str(e)}',
                'error_code': 'SUBMIT_AND_SIGN_ERROR'
            }
    
    def unsign_subject(self, subject_code, unsigned_by, verbose=0):
        """取消受試者電子簽署（使用 update_databases 函數）
        
        Args:
            subject_code: 受試者編號
            unsigned_by: 取消簽署者
            verbose: 詳細模式
            
        Returns:
            操作結果字典
        """
        try:
            self.connect()
            
            # 檢查受試者是否存在且已簽署
            result = self.sql.search('subjects', ['status', 'signature_hash', 'signed_by', 'signed_at'], 
                                criteria=f"`subject_code`='{subject_code}'", verbose=verbose)
            
            if not result:
                return {
                    'success': False,
                    'message': '受試者不存在'
                }
            
            current_status = result[0][0]
            current_signature_hash = result[0][1]
            current_signed_by = result[0][2]
            current_signed_at = result[0][3]
            
            if current_status != 'signed':
                return {
                    'success': False,
                    'message': '該受試者尚未簽署，無法取消簽署'
                }
            
            # 準備更新資料
            current_time = datetime.now().strftime('%Y-%m-%d %H:%M:%S')
            
            additional_updates = {
                'subjects': {
                    'status': 'draft',
                    'signature_hash': None,
                    'signed_by': None,
                    'signed_at': None,
                    'updated_by': unsigned_by,
                    'updated_at': current_time
                },
                'inclusion_criteria': {
                    'status': 'draft',
                    'signature_hash': None,
                    'signed_by': None,
                    'signed_at': None,
                    'updated_by': unsigned_by,
                    'updated_at': current_time
                },
                'exclusion_criteria': {
                    'status': 'draft',
                    'signature_hash': None,
                    'signed_by': None,
                    'signed_at': None,
                    'updated_by': unsigned_by,
                    'updated_at': current_time
                }
            }
            
            # 使用 update_databases 函數更新三個表
            update_result = self.update_databases(
                subject_code=subject_code,
                user_id=unsigned_by,
                action_type='UNSIGN',
                additional_updates=additional_updates,
                verbose=verbose
            )
            
            if not update_result['success']:
                return update_result
            
            # 記錄取消簽署的詳細日誌
            log_changes = [
                {
                    'table_name': 'system',
                    'field_name': 'status',
                    'old_value': current_status,
                    'new_value': 'draft',
                    'action': 'UNSIGN'
                },
                {
                    'table_name': 'system',
                    'field_name': 'operation',
                    'old_value': 'update_signature',
                    'new_value': '',
                    'action': 'UNSIGN'
                },
                {
                    'table_name': 'system',
                    'field_name': 'signed_by',
                    'old_value': current_signed_by,
                    'new_value': '',
                    'action': 'UNSIGN'
                },
                {
                    'table_name': 'system',
                    'field_name': 'signed_at',
                    'old_value': current_signed_at,
                    'new_value': '',
                    'action': 'UNSIGN'
                }
            ]
            
            # 使用 update_logs 記錄變更
            log_result = self.update_logs(
                subject_code=subject_code,
                user_id=unsigned_by,
                action_type='UNSIGN',
                log_changes=log_changes,
                log_id=update_result.get('log_id'),
                verbose=verbose
            )
            
            if not log_result['success']:
                return {
                    'success': False,
                    'message': '記錄日誌失敗'
                }
            
            return {
                'success': True,
                'message': '取消簽署成功',
                'log_id': update_result.get('log_id'),
                'updated_tables': update_result.get('updated_tables', [])
            }
                
        except Exception as e:
            logger.error(f"取消簽署失敗: {e}")
            return {
                'success': False,
                'message': f'取消簽署失敗: {str(e)}'
            }

    def _generate_log_id(self):
        """生成日誌ID"""
        from datetime import datetime
        import hashlib
        
        # 使用當前時間戳生成唯一ID
        timestamp = datetime.now().strftime("%Y%m%d%H%M%S%f")
        hash_obj = hashlib.md5(timestamp.encode())
        return hash_obj.hexdigest()[:7].upper()
    
    def update_databases(self, subject_code, user_id, action_type, additional_updates=None, log_id=None, verbose=0):
        """更新資料表函數
        
        Args:
            subject_code: 受試者編號
            user_id: 使用者ID
            action_type: 操作類型 (如 'UPDATE', 'SUBMIT', 'SIGN', 'SUBMIT_AND_SIGN')
            additional_updates: 額外的資料表更新，格式：{
                'subjects': {'status': 'submitted', 'updated_by': user_id},
                'inclusion_criteria': {'status': 'submitted'},
                'exclusion_criteria': {'status': 'submitted'}
            }
            log_id: 外部傳入的 log_id（如果為 None 則自動生成）
            verbose: 詳細模式 (0/1)
            
        Returns:
            更新結果字典
        """
        try:
            from datetime import datetime
            
            # 如果沒有提供 log_id，則自動生成
            if log_id is None:
                log_id = self._generate_log_id()
            
            if verbose:
                print("1. log_id: ", log_id)
            timestamp = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
            
            updated_tables = []
            
            # 只更新 additional_updates 中指定的資料表
            if additional_updates:
                for table, updates in additional_updates.items():
                    # 獲取累積的 log_id
                    updated_log = self.get_cumulative_log_id(table, subject_code, log_id, verbose)
                    
                    # 構建更新資料
                    update_parts = [f"`log`='{updated_log}'"]
                    
                    # 添加額外的更新資料
                    for field, value in updates.items():
                        if field == 'updated_at' or field == 'signed_at':
                            update_parts.append(f"`{field}`='{timestamp}'")
                        elif value is None or value == '':
                            # 對於 None 值或空字串，設為 NULL
                            update_parts.append(f"`{field}`=NULL")
                        else:
                            update_parts.append(f"`{field}`='{value}'")
                    
                    update_data = ', '.join(update_parts)
                    update_result = self.sql.update(table, update_data, criteria=f"`subject_code`='{subject_code}'", verbose=verbose)
                    
                    if isinstance(update_result, str):
                        return {
                            'success': False,
                            'message': f'更新 {table} 失敗: {update_result}',
                            'error_code': 'UPDATE_DATABASE_FAILED'
                        }
                    
                    updated_tables.append(table)
                    if verbose:
                        print(f"成功更新 {table} 資料表")
            
            return {
                'success': True,
                'message': '資料表更新成功',
                'log_id': log_id,
                'timestamp': timestamp,
                'updated_tables': updated_tables
            }
            
        except Exception as e:
            logger.error(f"資料表更新失敗: {e}")
            return {
                'success': False,
                'message': f'資料表更新失敗: {str(e)}',
                'error_code': 'UPDATE_DATABASE_FAILED'
            }
    
    def update_logs(self, subject_code, user_id, action_type, log_changes=None, log_id=None, verbose=0):
        """更新日誌記錄函數
        
        Args:
            subject_code: 受試者編號
            user_id: 使用者ID
            action_type: 操作類型 (如 'UPDATE', 'SUBMIT', 'SIGN', 'SUBMIT_AND_SIGN')
            log_changes: 變更記錄列表，格式：[{
                'table_name': 'subjects',
                'field_name': 'field_name',
                'old_value': 'old_value',
                'new_value': 'new_value',
                'action': 'UPDATE'
            }]
            log_id: 可選的 log_id（如果為 None 則自動生成）
            verbose: 詳細模式 (0/1)
            
        Returns:
            更新結果字典
        """
        try:
            from datetime import datetime
            
            # 如果沒有提供 log_id，則自動生成
            if log_id is None:
                log_id = self._generate_log_id()
            
            if verbose:
                print("2. log_id: ", log_id)
            timestamp = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
            recorded_changes = 0
            
            # 記錄變更到 edit_log 表
            if log_changes:
                for change in log_changes:
                    change['log_id'] = log_id
                    change['subject_code'] = subject_code
                    change['user_id'] = user_id
                    change['action'] = action_type
                    
                    # columns = self.column_id['EDC']['column_id_edit_log']
                    columns = ['log_id', 'subject_code', 'table_name', 'field_name', 'old_value', 'new_value', 'action', 'user_id', 'created_at']
                    values = [
                        change['log_id'],
                        change['subject_code'],
                        change['table_name'],
                        change['field_name'],
                        str(change['old_value']) if change['old_value'] is not None else '',
                        str(change['new_value']) if change['new_value'] is not None else '',
                        change['action'],
                        change['user_id'],
                        'NOW()'
                    ]
                    
                    # 手動構建 INSERT 語句以避免 NOW() 被當作字串
                    columns_str = ','.join(columns)
                    values_str = "'" + "','".join(values[:-1]) + "',NOW()"
                    query = f"INSERT INTO edit_log({columns_str}) VALUES({values_str})"
                    
                    if verbose:
                        print(f"Query String(Insert edit_log): {query}")
                    
                    try:
                        cursor = self.sql.db.cursor()
                        cursor.execute(query)
                        self.sql.db.commit()
                        recorded_changes += 1
                        if verbose:
                            print(f"成功插入 edit_log: {change['table_name']}.{change['field_name']}")
                    except Exception as err:
                        logger.error(f"插入編輯日誌失敗: {err}")
                        return {
                            'success': False,
                            'message': f'插入編輯日誌失敗: {str(err)}',
                            'error_code': 'INSERT_LOG_FAILED'
                        }
            
            # 記錄系統操作日誌（如果沒有其他變更記錄）
            if not log_changes:
                system_log = {
                    'log_id': log_id,
                    'subject_code': subject_code,
                    'table_name': 'system',
                    'field_name': 'operation',
                    'old_value': '',
                    'new_value': action_type.lower(),
                    'action': action_type,
                    'user_id': user_id
                }
                
                columns = ['log_id', 'subject_code', 'table_name', 'field_name', 'old_value', 'new_value', 'action', 'user_id', 'created_at']
                values = [
                    system_log['log_id'],
                    system_log['subject_code'],
                    system_log['table_name'],
                    system_log['field_name'],
                    system_log['old_value'],
                    system_log['new_value'],
                    system_log['action'],
                    system_log['user_id'],
                    'NOW()'
                ]
                
                columns_str = ','.join(columns)
                values_str = "'" + "','".join(values[:-1]) + "',NOW()"
                query = f"INSERT INTO edit_log({columns_str}) VALUES({values_str})"
                
                try:
                    cursor = self.sql.db.cursor()
                    cursor.execute(query)
                    self.sql.db.commit() 
                    recorded_changes = 1
                    if verbose:
                        print(f"成功插入系統操作日誌: {action_type}")
                except Exception as err:
                    logger.error(f"插入系統操作日誌失敗: {err}")
                    return {
                        'success': False,
                        'message': f'插入系統操作日誌失敗: {str(err)}',
                        'error_code': 'INSERT_LOG_FAILED'
                    }
            
            return {
                'success': True,
                'message': '日誌記錄成功',
                'log_id': log_id,
                'timestamp': timestamp,
                'recorded_changes': recorded_changes
            }
            
        except Exception as e:
            logger.error(f"日誌記錄失敗: {e}")
            return {
                'success': False,
                'message': f'日誌記錄失敗: {str(e)}',
                'error_code': 'UPDATE_LOGS_FAILED'
            }
    
    def generate_signature_hash(self, subject_code, user_id, timestamp, record_data):
        """生成簽章雜湊值
        
        Args:
            subject_code: 受試者編號
            user_id: 使用者ID
            timestamp: 時間戳
            record_data: 記錄資料
            
        Returns:
            SHA-256 雜湊值
        """
        import hashlib
        import json
        
        try:
            # 組合簽章字串（與前端邏輯一致）
            signature_string = f"{subject_code}|{user_id}|{timestamp}|{json.dumps(record_data, sort_keys=True)}"
            
            # 生成 SHA-256 hash
            hash_obj = hashlib.sha256(signature_string.encode('utf-8'))
            signature_hash = hash_obj.hexdigest()
            
            logger.info(f"後端生成簽章雜湊 - 受試者: {subject_code}, 雜湊: {signature_hash[:16]}...")
            return signature_hash
            
        except Exception as e:
            logger.error(f"生成簽章雜湊失敗: {e}")
            raise e
    
    def verify_signature_hash(self, subject_code, user_id, timestamp, record_data, expected_hash):
        """驗證簽章雜湊值
        
        Args:
            subject_code: 受試者編號
            user_id: 使用者ID  
            timestamp: 時間戳
            record_data: 記錄資料
            expected_hash: 預期的雜湊值（來自前端）
            
        Returns:
            dict: 驗證結果
        """
        try:
            # 重新計算雜湊值
            calculated_hash = self.generate_signature_hash(subject_code, user_id, timestamp, record_data)
            
            # 比對雜湊值
            is_valid = calculated_hash == expected_hash
            
            logger.info(f"雜湊驗證結果 - 受試者: {subject_code}, 一致性: {is_valid}")
            if not is_valid:
                logger.warning(f"雜湊不一致 - 預期: {expected_hash[:16]}..., 計算: {calculated_hash[:16]}...")
            
            return {
                'valid': is_valid,
                'calculated_hash': calculated_hash,
                'expected_hash': expected_hash,
                'message': '雜湊驗證通過' if is_valid else '雜湊驗證失敗，資料可能已被竄改'
            }
            
        except Exception as e:
            logger.error(f"雜湊驗證失敗: {e}")
            return {
                'valid': False,
                'calculated_hash': None,
                'expected_hash': expected_hash,
                'message': f'雜湊驗證錯誤: {str(e)}'
            }
    
    def sign_subject_with_hash(self, subject_code, user_id, frontend_hash, frontend_timestamp, record_data, verbose=0):
        """簽署受試者資料（包含雜湊驗證）
        
        Args:
            subject_code: 受試者編號
            user_id: 簽署者ID
            frontend_hash: 前端計算的雜湊值
            frontend_timestamp: 前端時間戳
            record_data: 記錄資料
            verbose: 詳細模式
            
        Returns:
            簽署結果字典
        """
        try:
            # 1. 驗證前端雜湊
            if frontend_hash:
                verification_result = self.verify_signature_hash(
                    subject_code, user_id, frontend_timestamp, record_data, frontend_hash
                )
                
                if not verification_result['valid']:
                    return {
                        'success': False,
                        'message': f'簽章驗證失敗: {verification_result["message"]}',
                        'error_code': 'HASH_VERIFICATION_FAILED'
                    }
                
                # 使用驗證通過的雜湊值
                signature_hash = verification_result['calculated_hash']
            else:
                # 如果沒有前端雜湊，後端自行生成
                from datetime import datetime
                timestamp = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
                current_data = self.get_subject_detail_by_code(subject_code)
                signature_hash = self.generate_signature_hash(subject_code, user_id, timestamp, current_data)
            
            # 2. 執行簽署流程
            result = self._execute_sign_subject(subject_code, user_id, verbose)
            
            if result['success']:
                # 3. 更新 signature_hash 到三個資料表
                self.update_signature_hashes(subject_code, signature_hash, user_id, verbose)
                
                # 4. 在回應中包含雜湊資訊
                result['signature_hash'] = signature_hash
                result['hash_verified'] = bool(frontend_hash)
            
            return result
            
        except Exception as e:
            logger.error(f"帶雜湊驗證的簽署失敗: {e}")
            return {
                'success': False,
                'message': f'簽署失敗: {str(e)}',
                'error_code': 'SIGN_WITH_HASH_ERROR'
            }
    
    def submit_and_sign_with_hash(self, subject_code, user_id, frontend_hash, frontend_timestamp, record_data, verbose=0):
        """提交審核並簽署受試者資料（包含雜湊驗證）
        
        Args:
            subject_code: 受試者編號
            user_id: 簽署者ID
            frontend_hash: 前端計算的雜湊值
            frontend_timestamp: 前端時間戳
            record_data: 記錄資料
            verbose: 詳細模式
            
        Returns:
            操作結果字典
        """
        try:
            # 1. 驗證前端雜湊
            if frontend_hash:
                verification_result = self.verify_signature_hash(
                    subject_code, user_id, frontend_timestamp, record_data, frontend_hash
                )
                
                if not verification_result['valid']:
                    return {
                        'success': False,
                        'message': f'簽章驗證失敗: {verification_result["message"]}',
                        'error_code': 'HASH_VERIFICATION_FAILED'
                    }
                
                # 使用驗證通過的雜湊值
                signature_hash = verification_result['calculated_hash']
            else:
                # 如果沒有前端雜湊，後端自行生成
                from datetime import datetime
                timestamp = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
                current_data = self.get_subject_detail_by_code(subject_code)
                signature_hash = self.generate_signature_hash(subject_code, user_id, timestamp, current_data)
            
            # 2. 執行提交並簽署流程（直接整合邏輯，不再依賴舊函數）
            result = self._execute_submit_and_sign(subject_code, user_id, verbose)
            
            if result['success']:
                # 3. 更新 signature_hash 到三個資料表
                self.update_signature_hashes(subject_code, signature_hash, user_id, verbose)
                
                # 4. 在回應中包含雜湊資訊
                result['signature_hash'] = signature_hash
                result['hash_verified'] = bool(frontend_hash)
            
            return result
            
        except Exception as e:
            logger.error(f"帶雜湊驗證的提交並簽署失敗: {e}")
            return {
                'success': False,
                'message': f'提交並簽署失敗: {str(e)}',
                'error_code': 'SUBMIT_AND_SIGN_WITH_HASH_ERROR'
            }
    
    def update_signature_hashes(self, subject_code, signature_hash, user_id, verbose=0):
        """更新三個資料表的 signature_hash 欄位
        
        Args:
            subject_code: 受試者編號
            signature_hash: 簽章雜湊值
            user_id: 使用者ID
            verbose: 詳細模式
        """
        try:
            self.connect()
            
            # 使用統一的日誌更新函數
            additional_updates = {
                'subjects': {'signature_hash': signature_hash},
                'inclusion_criteria': {'signature_hash': signature_hash},
                'exclusion_criteria': {'signature_hash': signature_hash}
            }
            
            # 1. 先更新資料表
            db_result = self.update_databases(
                subject_code=subject_code,
                user_id=user_id,
                action_type='UPDATE_SIGNATURE',
                additional_updates=additional_updates,
                verbose=verbose
            )
            
            if not db_result['success']:
                return db_result
            
            # 2. 再記錄日誌
            result = self.update_logs(
                subject_code=subject_code,
                user_id=user_id,
                action_type='UPDATE_SIGNATURE',
                log_changes=None,
                log_id=db_result.get('log_id'),
                verbose=verbose
            )
            
            if result['success']:
                logger.info(f"成功更新 {subject_code} 的 signature_hash")
                return {
                    'success': True,
                    'message': '簽章雜湊更新成功',
                    'log_id': result.get('log_id')
                }
            else:
                logger.error(f"更新 signature_hash 失敗: {result['message']}")
                return {
                    'success': False,
                    'message': f"更新 signature_hash 失敗: {result['message']}",
                    'error_code': 'UPDATE_SIGNATURE_FAILED'
                }
            
        except Exception as e:
            logger.error(f"更新 signature_hash 失敗: {e}")
            return {
                'success': False,
                'message': f"更新 signature_hash 失敗: {str(e)}",
                'error_code': 'UPDATE_SIGNATURE_EXCEPTION'
            }

    def validate_required_fields(self, subject_code, verbose=0):
        """驗證必填欄位是否完整
        
        Args:
            subject_code: 受試者編號
            verbose: 詳細模式 (0/1)
            
        Returns:
            驗證結果字典
        """
        try:
            self.connect()
            
            missing_fields = []
            validation_details = {
                'subjects': {'checked': False, 'missing': []},
                'inclusion_criteria': {'checked': False, 'missing': []},
                'exclusion_criteria': {'checked': False, 'missing': []}
            }
            
            # 1. 檢查 subjects 表的必填欄位
            subject_result = self.sql.search('subjects', ['*'], criteria=f"`subject_code`='{subject_code}'")
            if not subject_result:
                return {
                    'success': False,
                    'message': '受試者不存在於資料庫中',
                    'error_code': 'SUBJECT_NOT_FOUND',
                    'validation_details': validation_details
                }
            
            subject_data = subject_result[0]
            validation_details['subjects']['checked'] = True
            
            # 定義必填欄位（根據臨床試驗需求）
            required_subject_fields = {
                2: 'date_of_birth',   # 出生日期
                4: 'gender',          # 性別  
                5: 'height_cm',       # 身高
                6: 'weight_kg',       # 體重
                16: 'imaging_type',   # 影像檢查類型
                17: 'imaging_date'    # 影像檢查日期
            }
            
            for idx, field_name in required_subject_fields.items():
                # 特別處理數值型欄位：0 是有效值，None 和空字串才是無效的
                value = subject_data[idx]
                if value is None or value == '':
                    missing_fields.append(f'受試者資料.{field_name}')
                    validation_details['subjects']['missing'].append(field_name)
            
            # 2. 檢查 inclusion_criteria 表（納入條件評估）
            inclusion_result = self.sql.search('inclusion_criteria', ['*'], criteria=f"`subject_code`='{subject_code}'")
            if not inclusion_result:
                missing_fields.append('納入條件評估表（整個表格未建立）')
                validation_details['inclusion_criteria']['missing'].append('entire_table')
            else:
                validation_details['inclusion_criteria']['checked'] = True
                inclusion_data = inclusion_result[0]
                # 檢查關鍵的納入條件欄位
                inclusion_field_mapping = {
                    2: 'age_18_above',              # 索引2
                    3: 'gender_available',          # 索引3
                    4: 'age_available',             # 索引4
                    5: 'bmi_available',             # 索引5
                    6: 'dm_history_available',      # 索引6
                    7: 'gout_history_available',    # 索引7
                    8: 'egfr_available',            # 索引8
                    9: 'urine_ph_available',        # 索引9
                    10: 'urine_sg_available',       # 索引10
                    11: 'urine_rbc_available',      # 索引11
                    12: 'bacteriuria_available',    # 索引12
                    13: 'lab_interval_7days',       # 索引13
                    14: 'imaging_available',        # 索引14
                    15: 'kidney_structure_visible', # 索引15
                    16: 'mid_ureter_visible',       # 索引16
                    17: 'lower_ureter_visible',     # 索引17
                    18: 'imaging_lab_interval_7days', # 索引18
                    19: 'no_treatment_during_exam'  # 索引19
                }
                
                for idx, field_name in inclusion_field_mapping.items():
                    if idx < len(inclusion_data):
                        value = inclusion_data[idx]
                        # 對於納入條件，0 和 1 都是有效值，只有 None 才是無效的
                        if value is None:
                            missing_fields.append(f'納入條件.{field_name}')
                            validation_details['inclusion_criteria']['missing'].append(field_name)
            
            # 3. 檢查 exclusion_criteria 表（排除條件評估）
            exclusion_result = self.sql.search('exclusion_criteria', ['*'], criteria=f"`subject_code`='{subject_code}'")
            if not exclusion_result:
                missing_fields.append('排除條件評估表（整個表格未建立）')
                validation_details['exclusion_criteria']['missing'].append('entire_table')
            else:
                validation_details['exclusion_criteria']['checked'] = True
                exclusion_data = exclusion_result[0]
                # 檢查關鍵的排除條件欄位
                exclusion_field_mapping = {
                    2: 'pregnant_female',           # 索引2
                    3: 'kidney_transplant',         # 索引3  
                    4: 'urinary_tract_foreign_body', # 索引4
                    6: 'non_stone_urological_disease', # 索引6
                    8: 'renal_replacement_therapy',  # 索引8
                    10: 'medical_record_incomplete', # 索引10
                    11: 'major_blood_immune_cancer', # 索引11
                    13: 'rare_metabolic_disease',    # 索引13
                    15: 'investigator_judgment'      # 索引15
                }
                
                for idx, field_name in exclusion_field_mapping.items():
                    if idx < len(exclusion_data):
                        value = exclusion_data[idx]
                        # 對於排除條件，0 和 1 都是有效值，只有 None 才是無效的
                        if value is None:
                            missing_fields.append(f'排除條件.{field_name}')
                            validation_details['exclusion_criteria']['missing'].append(field_name)
            
            # 返回驗證結果
            if missing_fields:
                return {
                    'success': False,
                    'message': f'資料庫中發現 {len(missing_fields)} 個必填欄位未完成',
                    'missing_fields': missing_fields,
                    'validation_details': validation_details,
                    'error_code': 'MISSING_REQUIRED_FIELDS'
                }
            
            return {
                'success': True,
                'message': '資料庫中所有必填欄位已完成，可以提交審核',
                'validation_details': validation_details
            }
            
        except Exception as e:
            logger.error(f"驗證必填欄位失敗: {e}")
            return {
                'success': False,
                'message': f'驗證失敗: {str(e)}',
                'error_code': 'VALIDATION_ERROR'
            }

    def freeze_subject_data(self, subject_code, frozen_by, verbose=0):
        """凍結受試者資料
        
        Args:
            subject_code: 受試者編號
            frozen_by: 凍結者 ID
            verbose: 詳細模式 (0/1)
            
        Returns:
            凍結結果字典
        """
        try:
            from datetime import datetime
            
            # 生成凍結日誌 ID
            log_id = self._generate_log_id()
            timestamp = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
            
            if verbose:
                print(f"開始凍結受試者 {subject_code} 的資料")
                print(f"凍結者: {frozen_by}")
                print(f"凍結時間: {timestamp}")
                print(f"日誌 ID: {log_id}")
            
            # 檢查受試者是否存在
            subject_exists = self.sql.search('subjects', ['subject_code'], f"`subject_code`='{subject_code}'")
            if not subject_exists or subject_exists == "error occurs!":
                return {
                    'success': False,
                    'message': f'受試者 {subject_code} 不存在',
                    'error_code': 'SUBJECT_NOT_FOUND'
                }
            
            # 檢查資料是否已經凍結
            current_status = self.sql.search('subjects', ['status'], f"`subject_code`='{subject_code}'")
            if current_status and current_status != "error occurs!" and len(current_status) > 0:
                status = current_status[0][0]  # 第一個結果的第一個欄位
                if status == 'frozen':
                    return {
                        'success': False,
                        'message': f'受試者 {subject_code} 的資料已經凍結',
                        'error_code': 'ALREADY_FROZEN'
                    }
                
                # 檢查資料是否已簽署（凍結前必須先簽署）
                if status != 'signed':
                    return {
                        'success': False,
                        'message': f'受試者 {subject_code} 的資料尚未簽署，無法凍結',
                        'error_code': 'NOT_SIGNED'
                    }
            
            # 使用 update_databases 函數凍結三個資料表
            additional_updates = {
                'subjects': {
                    'status': 'frozen',
                    'frozen_by': frozen_by,
                    'frozen_at': timestamp
                },
                'inclusion_criteria': {
                    'status': 'frozen',
                    'frozen_by': frozen_by,
                    'frozen_at': timestamp
                },
                'exclusion_criteria': {
                    'status': 'frozen',
                    'frozen_by': frozen_by,
                    'frozen_at': timestamp
                }
            }
            
            # 調用 update_databases 函數
            update_result = self.update_databases(
                subject_code=subject_code,
                user_id=frozen_by,
                action_type='FREEZE',
                additional_updates=additional_updates,
                log_id=log_id,
                verbose=verbose
            )
            
            if update_result['success']:
                # 記錄凍結操作的系統日誌（統一記錄，不記錄具體欄位變更）
                log_result = self.update_logs(
                    subject_code=subject_code,
                    user_id=frozen_by,
                    action_type='FREEZE',
                    log_changes=None,  # 使用系統版記錄，不傳入 log_changes
                    log_id=log_id,
                    verbose=verbose
                )
                
                if not log_result['success']:
                    if verbose:
                        print(f"日誌記錄失敗: {log_result.get('message', '未知錯誤')}")
                
                return {
                    'success': True,
                    'message': f'成功凍結受試者 {subject_code} 的資料',
                    'log_id': log_id,
                    'frozen_tables': update_result.get('updated_tables', []),
                    'frozen_at': timestamp,
                    'log_recorded': log_result['success']
                }
            else:
                return {
                    'success': False,
                    'message': f'凍結失敗: {update_result.get("message", "未知錯誤")}',
                    'error_code': 'FREEZE_FAILED'
                }
                
        except Exception as e:
            logger.error(f"凍結受試者資料失敗: {e}")
            return {
                'success': False,
                'message': f'凍結失敗: {str(e)}',
                'error_code': 'FREEZE_ERROR'
            }