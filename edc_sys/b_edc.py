"""
EDC System Blueprint - 電子資料擷取系統藍圖

參考 permission_sys/b_permission.py 的架構
使用相同的 Blueprint 模式和 JSON API 回應格式
"""

from flask import Blueprint, render_template, request, redirect, url_for, flash, jsonify, make_response, send_file
from flask_login import login_required, current_user
from .edc_function import edc_db
from datetime import datetime
import json
import logging
import io

logging.basicConfig(level=logging.INFO)
VERBOSE=True

edc_sys = edc_db()

edc_blueprints = Blueprint('edc', __name__, template_folder='templates', static_folder='static')

def get_client_ip(request):
    """獲取客戶端 IP (仿照 permission_sys 格式)"""
    x_forwarded_for = request.headers.get('X-Forwarded-For')
    if x_forwarded_for:
        client_ip = x_forwarded_for.split(',')[0].strip()
    else:
        client_ip = request.remote_addr
    return client_ip


@edc_blueprints.route('/test', methods=['GET', 'POST'])
def test():
    return "this is an EDC system test page."


@edc_blueprints.route('/submit-ecrf', methods=['POST'])
@login_required
def submit_ecrf():
    """
    提交 eCRF 表單 API
    
    請求格式:
    {
        "subject_data": {...},
        "inclusion_data": {...},
        "exclusion_data": {...}
    }
    
    回應格式:
    {
        "status": "success",
        "message": "eCRF 提交成功",
        "subject_id": 123,
        "subject_code": "S001"
    }
    """
    try:
        content = request.get_json()
        if not content:
                    return jsonify({
            "success": False,
            "message": "缺少請求內容",
            "content": "ecrf_submit"
        })
        
        # 獲取使用者資訊
        user_id = current_user.UNIQUE_ID
        ip = get_client_ip(request)
        timestamp = datetime.now().strftime("%Y%m%d-%H:%M:%S")
        
        # 使用事務性插入，確保三個表都能成功插入
        result = edc_sys.insert_subject_with_criteria(
            content.get('subject_data', {}),
            content.get('inclusion_data', {}),
            content.get('exclusion_data', {}),
            user_id,
            verbose=VERBOSE
        )
        
        if not result['success']:
            return jsonify({
                "success": False,
                "message": f"事務性插入失敗: {result['message']}",
                "content": "ecrf_submit"
            })
        
        # 4. 進行資格評估
        eligibility_result = edc_sys.evaluate_eligibility(result['subject_id'])
        
        return jsonify({
            "success": True,
            "message": "eCRF 提交成功",
            "subject_id": result['subject_id'],
            "subject_code": result['subject_code'],
            "inclusion_id": result['inclusion_id'],
            "exclusion_id": result['exclusion_id'],
            "eligibility": eligibility_result.get('overall_eligibility', 'Unknown'),
            "timestamp": timestamp
        })
        
    except Exception as e:
        logging.error(f"eCRF 提交失敗: {e}")
        return jsonify({
            "success": False,
            "message": f"提交失敗: {str(e)}",
            "content": "ecrf_submit"
        }), 500


@edc_blueprints.route('/get-subject/<int:subject_id>', methods=['GET'])
@login_required
def get_subject(subject_id):
    """
    獲取受試者資料 API
    
    GET /get-subject/123
    
    回應格式:
    {
        "status": "success",
        "subject": {...},
        "inclusion_criteria": {...},
        "exclusion_criteria": {...}
    }
    """
    try:
        subject_data = edc_sys.get_subject(subject_id)
        
        if not subject_data:
                    return jsonify({
            "success": False,
            "message": "受試者不存在",
            "content": "get_subject"
        }), 404
        
        return jsonify({
            "success": True,
            "subject": subject_data.get('subject', {}),
            "inclusion_criteria": subject_data.get('inclusion_criteria', {}),
            "exclusion_criteria": subject_data.get('exclusion_criteria', {})
        })
        
    except Exception as e:
        logging.error(f"獲取受試者資料失敗: {e}")
        return jsonify({
            "success": False,
            "message": f"獲取失敗: {str(e)}",
            "content": "get_subject"
        }), 500


@edc_blueprints.route('/search-subjects', methods=['GET', 'POST'])
@login_required
def search_subjects():
    """
    搜尋受試者 API
    
    GET 方法: 從 query string 獲取搜尋參數
    POST 方法: 從 JSON body 獲取搜尋參數
    
    請求格式:
    GET: /search-subjects?term=S001&limit=10
    POST: {"search_term": "S001", "limit": 10}
    
    回應格式:
    {
        "status": "success",
        "subjects": [...],
        "total": 5
    }
    """
    try:
        if request.method == 'GET':
            search_term = request.args.get('term', '')
            limit = int(request.args.get('limit', 50))
        else:
            print("POST request received")
            content = request.get_json()
            print(content)
            if not content:
                        return jsonify({
                "success": False,
                "message": "缺少請求內容",
                "content": "search_subjects"
            })
            search_term = content.get('search_term', '')
            limit = content.get('limit', 50)
            print("search_term: ", search_term)
            print("limit: ", limit)
        
        if not search_term:
                    return jsonify({
            "success": False,
            "message": "缺少搜尋關鍵字",
            "content": "search_subjects"
        })
        
        subjects = edc_sys.search_subjects(search_term, limit)
        
        return jsonify({
            "success": True,
            "subjects": subjects,
            "total": len(subjects),
            "search_term": search_term
        })
        
    except Exception as e:
        logging.error(f"搜尋受試者失敗: {e}")
        return jsonify({
            "success": False,
            "message": f"搜尋失敗: {str(e)}",
            "content": "search_subjects"
        }), 500


@edc_blueprints.route('/evaluate-eligibility/<int:subject_id>', methods=['GET'])
@login_required
def evaluate_eligibility(subject_id):
    """
    評估受試者資格 API
    
    GET /evaluate-eligibility/123
    
    回應格式:
    {
        "status": "success",
        "subject_id": 123,
        "inclusion_score": {...},
        "exclusion_score": {...},
        "overall_eligibility": "Eligible"
    }
    """
    try:
        eligibility_result = edc_sys.evaluate_eligibility(subject_id)
        
        if not eligibility_result['success']:
                    return jsonify({
            "success": False,
            "message": eligibility_result['message'],
            "content": "evaluate_eligibility"
        }), 400
        
        return jsonify({
            "success": True,
            "subject_id": subject_id,
            "inclusion_score": eligibility_result.get('inclusion_score', {}),
            "exclusion_score": eligibility_result.get('exclusion_score', {}),
            "overall_eligibility": eligibility_result.get('overall_eligibility', 'Unknown')
        })
        
    except Exception as e:
        logging.error(f"資格評估失敗: {e}")
        return jsonify({
            "success": False,
            "message": f"評估失敗: {str(e)}",
            "content": "evaluate_eligibility"
        }), 500


@edc_blueprints.route('/update-subject/<int:subject_id>', methods=['PUT'])
@login_required
def update_subject(subject_id):
    """
    更新受試者資料 API
    
    PUT /update-subject/123
    {
        "subject_data": {...}
    }
    
    回應格式:
    {
        "status": "success",
        "message": "更新成功",
        "subject_id": 123
    }
    """
    try:
        content = request.get_json()
        if not content or 'subject_data' not in content:
                    return jsonify({
            "success": False,
            "message": "缺少受試者資料",
            "content": "update_subject"
        })
        
        user_id = current_user.UNIQUE_ID
        
        update_result = edc_sys.update_subject(
            subject_id, 
            content['subject_data'], 
            user_id
        )
        
        if not update_result['success']:
            return jsonify({
                "success": False,
                "message": update_result['message'],
                "content": "update_subject"
            }), 400
        
        return jsonify({
            "success": True,
            "message": update_result['message'],
            "subject_id": subject_id
        })
        
    except Exception as e:
        logging.error(f"更新受試者失敗: {e}")
        return jsonify({
            "success": False,
            "message": f"更新失敗: {str(e)}",
            "content": "update_subject"
        }), 500


@edc_blueprints.route('/dashboard', methods=['GET'])
@login_required
def dashboard():
    """
    EDC 系統儀表板
    
    顯示受試者統計、資格評估狀態等資訊
    """
    try:
        # 這裡可以添加儀表板相關的統計資料
        # 例如：總受試者數量、合格數量、不合格數量等
        
        return jsonify({
            "success": True,
            "message": "EDC 系統儀表板",
            "dashboard_data": {
                "total_subjects": 0,  # 需要實現統計功能
                "eligible_subjects": 0,
                "ineligible_subjects": 0,
                "pending_evaluation": 0
            }
        })
        
    except Exception as e:
        logging.error(f"儀表板載入失敗: {e}")
        return jsonify({
            "success": False,
            "message": f"儀表板載入失敗: {str(e)}",
            "content": "dashboard"
        }), 500

@edc_blueprints.route('/search-subjects-advanced', methods=['POST'])
@login_required
def search_subjects_advanced():
    """進階搜尋受試者資料（分頁、排序、篩選）"""
    try:
        data = request.get_json()
        print("data: ", data)
        print("Current User: ", current_user.UNIQUE_ID)
        user_id = current_user.UNIQUE_ID
        
        filters = data.get('filters', {})
        page = data.get('page', 1) # 頁碼
        page_size = data.get('page_size', 20) # 每頁顯示的資料數量
        sort_field = data.get('sort_field', 'id') # 排序欄位
        sort_direction = data.get('sort_direction', 'DESC') # 排序方向
        
        result = edc_sys.search_subjects(
            user_id=user_id,
            filters=filters,
            page=page,
            page_size=page_size,
            sort_field=sort_field,
            sort_direction=sort_direction,
            verbose=VERBOSE
        )
        
        return jsonify(result)
        
    except Exception as e:
        logging.error(f"進階搜尋失敗: {e}")
        return jsonify({
            'success': False,
            'message': f'搜尋失敗: {str(e)}'
        }), 500

@edc_blueprints.route('/get-statistics', methods=['GET'])
@login_required
def get_statistics():
    """獲取受試者統計資料"""
    try:
        result = edc_sys.get_subject_statistics(verbose=VERBOSE)
        return jsonify(result)
        
    except Exception as e:
        logging.error(f"獲取統計資料失敗: {e}")
        return jsonify({
            'success': False,
            'message': f'獲取統計資料失敗: {str(e)}'
        }), 500

@edc_blueprints.route('/export-subjects', methods=['POST'])
@login_required
def export_subjects():
    """匯出受試者資料"""
    try:
        data = request.get_json()
        
        # 提取匯出參數
        filters = data.get('filters', {})
        export_format = data.get('format', 'csv')
        
        # 執行匯出
        result = edc_sys.export_subjects_data(
            filters=filters,
            format=export_format,
            verbose=VERBOSE
        )
        
        if not result['success']:
            return jsonify(result), 400
        
        # 創建檔案物件
        file_obj = io.BytesIO(result['data'].encode('utf-8'))
        file_obj.seek(0)
        
        # 設定檔案名稱
        filename = result['filename']
        
        return send_file(
            file_obj,
            mimetype=result['content_type'],
            as_attachment=True,
            download_name=filename
        )
        
    except Exception as e:
        logging.error(f"匯出失敗: {e}")
        return jsonify({
            'success': False,
            'message': f'匯出失敗: {str(e)}'
        }), 500

@edc_blueprints.route('/subject/<subject_code>', methods=['GET'])
@login_required
def get_subject_by_code(subject_code):
    """根據受試者編號獲取受試者資料"""
    try:
        result = edc_sys.get_subject_by_code(subject_code, verbose=VERBOSE)
        
        if result:
            return jsonify({
                'success': True,
                'data': result
            })
        else:
            return jsonify({
                'success': False,
                'message': '受試者不存在'
            }), 404
        
    except Exception as e:
        logging.error(f"獲取受試者資料失敗: {e}")
        return jsonify({
            'success': False,
            'message': f'獲取受試者資料失敗: {str(e)}'
        }), 500

@edc_blueprints.route('/subject-id/<int:subject_id>', methods=['GET'])
@login_required
def get_subject_by_id_api(subject_id):
    """根據受試者ID獲取受試者資料"""
    try:
        result = edc_sys.get_subject_by_id(subject_id, verbose=VERBOSE)
        
        if result:
            return jsonify({
                'success': True,
                'data': result
            })
        else:
            return jsonify({
                'success': False,
                'message': '受試者不存在'
            }), 404
        
    except Exception as e:
        logging.error(f"獲取受試者資料失敗: {e}")
        return jsonify({
            'success': False,
            'message': f'獲取受試者資料失敗: {str(e)}'
        }), 500

@edc_blueprints.route('/subject-detail-id/<subject_code>', methods=['GET'])
@login_required
def get_subject_detail_by_id_api(subject_code):
    """根據受試者編號獲取受試者完整詳細資料（包含納入和排除條件）"""
    try:
        result = edc_sys.get_subject_detail_by_code(subject_code, verbose=VERBOSE)
        
        if result:
            return jsonify({
                'success': True,
                'data': result
            })
        else:
            return jsonify({
                'success': False,
                'message': '受試者不存在'
            }), 404
        
    except Exception as e:
        logging.error(f"獲取受試者詳細資料失敗: {e}")
        return jsonify({
            'success': False,
            'message': f'獲取受試者詳細資料失敗: {str(e)}'
        }), 500

@edc_blueprints.route('/subject-detail-code/<subject_code>', methods=['GET'])
@login_required
def get_subject_detail_by_code_api(subject_code):
    """根據受試者編號獲取受試者完整詳細資料（包含納入和排除條件）"""
    try:
        result = edc_sys.get_subject_detail_by_code(subject_code, verbose=VERBOSE)
        
        if result:
            return jsonify({
                'success': True,
                'data': result
            })
        else:
            return jsonify({
                'success': False,
                'message': '受試者不存在'
            }), 404
        
    except Exception as e:
        logging.error(f"獲取受試者詳細資料失敗: {e}")
        return jsonify({
            'success': False,
            'message': f'獲取受試者詳細資料失敗: {str(e)}'
        }), 500

@edc_blueprints.route('/update-subject/<subject_code>', methods=['PUT'])
@login_required
def update_subject_with_criteria_api(subject_code):
    """
    更新受試者資料、納入條件和排除條件 API
    
    請求格式:
    {
        "subject_data": {...},
        "inclusion_data": {...},
        "exclusion_data": {...},
        "edit_log_data": {
            "log_id": "20250901002",
            "changes": [
                {
                    "log_id": "20250901002",
                    "subject_code": "P010013",
                    "table_name": "subjects",
                    "field_name": "height_cm",
                    "old_value": "170.0",
                    "new_value": "175.0",
                    "action": "UPDATE",
                    "user_id": "kh00001"
                }
            ]
        }
    }
    
    回應格式:
    {
        "success": true,
        "message": "更新成功",
        "subject_code": "S001",
        "subject_id": 123
    }
    """
    try:
        content = request.get_json()
        if not content:
            return jsonify({
                "success": False,
                "message": "缺少請求內容",
                "content": "update_subject"
            })
        
        # 獲取使用者資訊
        user_id = current_user.UNIQUE_ID
        print("user_id: ", user_id)
        ip = get_client_ip(request)
        timestamp = datetime.now().strftime("%Y%m%d-%H:%M:%S")
        
        # 使用事務性更新，確保三個表都能成功更新
        result = edc_sys.update_subject_with_criteria(
            subject_code,
            content.get('subject_data', {}),
            content.get('inclusion_data', {}),
            content.get('exclusion_data', {}),
            user_id,
            edit_log_data=content.get('edit_log_data'),
            verbose=VERBOSE
        )
        
        if not result['success']:
            return jsonify({
                "success": False,
                "message": f"事務性更新失敗: {result['message']}",
                "content": "update_subject"
            })
        
        return jsonify({
            "success": True,
            "message": "受試者資料更新成功",
            "subject_code": result['subject_code'],
            "subject_id": result['subject_id'],
            "timestamp": timestamp
        })
        
    except Exception as e:
        logging.error(f"更新受試者資料失敗: {e}")
        return jsonify({
            "success": False,
            "message": f"更新失敗: {str(e)}",
            "content": "update_subject"
        }), 500

@edc_blueprints.route('/submit-for-review/<subject_code>', methods=['POST'])
@login_required
def submit_for_review_api(subject_code):
    """
    提交受試者資料供審核 API
    
    POST /submit-for-review/P010002
    
    回應格式:
    {
        "success": true,
        "message": "已成功提交審核，等待試驗主持人簽署",
        "subject_code": "P010002",
        "status": "submitted"
    }
    """
    try:
        # 獲取使用者資訊
        user_id = current_user.UNIQUE_ID
        
        # 先驗證必填欄位
        validation_result = edc_sys.validate_required_fields(subject_code, verbose=VERBOSE)
        if not validation_result['success']:
            return jsonify({
                "success": False,
                "message": validation_result['message'],
                "missing_fields": validation_result.get('missing_fields', []),
                "content": "submit_for_review"
            }), 400
        
        # 執行提交審核
        result = edc_sys.submit_for_review(subject_code, user_id, verbose=VERBOSE)
        
        if not result['success']:
            return jsonify({
                "success": False,
                "message": result['message'],
                "error_code": result.get('error_code'),
                "content": "submit_for_review"
            }), 400
        
        return jsonify({
            "success": True,
            "message": result['message'],
            "subject_code": result['subject_code'],
            "subject_id": result['subject_id'],
            "status": result['status'],
            "submitted_at": result['submitted_at'],
            "submitted_by": result['submitted_by']
        })
        
    except Exception as e:
        logging.error(f"提交審核失敗: {e}")
        return jsonify({
            "success": False,
            "message": f"提交審核失敗: {str(e)}",
            "content": "submit_for_review"
        }), 500

@edc_blueprints.route('/sign/<subject_code>', methods=['POST'])
@login_required
def sign_subject_api(subject_code):
    """
    簽署受試者資料 API
    
    POST /sign/P010002
    
    回應格式:
    {
        "success": true,
        "message": "已成功簽署受試者資料",
        "subject_code": "P010002",
        "status": "signed",
        "signed_at": "2025-01-01 12:00:00",
        "signed_by": "investigator001"
    }
    """
    try:
        # 獲取使用者資訊
        user_id = current_user.UNIQUE_ID
        
        # 執行簽署
        result = edc_sys.sign_subject(subject_code, user_id, verbose=VERBOSE)
        
        if not result['success']:
            return jsonify({
                "success": False,
                "message": result['message'],
                "error_code": result.get('error_code'),
                "content": "sign_subject"
            }), 400
        
        return jsonify({
            "success": True,
            "message": result['message'],
            "subject_code": result['subject_code'],
            "subject_id": result['subject_id'],
            "status": result['status'],
            "signed_at": result['signed_at'],
            "signed_by": result['signed_by']
        })
        
    except Exception as e:
        logging.error(f"簽署失敗: {e}")
        return jsonify({
            "success": False,
            "message": f"簽署失敗: {str(e)}",
            "content": "sign_subject"
        }), 500

@edc_blueprints.route('/submit-and-sign/<subject_code>', methods=['POST'])
@login_required
def submit_and_sign_api(subject_code):
    """
    提交審核並簽署受試者資料 API
    
    POST /submit-and-sign/P010002
    
    回應格式:
    {
        "success": true,
        "message": "已成功提交審核並簽署受試者資料",
        "subject_code": "P010002",
        "status": "signed",
        "signed_at": "2025-01-01 12:00:00",
        "signed_by": "investigator001"
    }
    """
    try:
        # 獲取使用者資訊
        user_id = current_user.UNIQUE_ID
        
        # 執行提交並簽署
        result = edc_sys.submit_and_sign(subject_code, user_id, verbose=VERBOSE)
        
        if not result['success']:
            return jsonify({
                "success": False,
                "message": result['message'],
                "error_code": result.get('error_code'),
                "missing_fields": result.get('missing_fields', []),
                "content": "submit_and_sign"
            }), 400
        
        return jsonify({
            "success": True,
            "message": result['message'],
            "subject_code": result['subject_code'],
            "subject_id": result['subject_id'],
            "status": result['status'],
            "signed_at": result['signed_at'],
            "signed_by": result['signed_by']
        })
        
    except Exception as e:
        logging.error(f"提交並簽署失敗: {e}")
        return jsonify({
            "success": False,
            "message": f"提交並簽署失敗: {str(e)}",
            "content": "submit_and_sign"
        }), 500

@edc_blueprints.route('/validate-required-fields/<subject_code>', methods=['GET'])
@login_required
def validate_required_fields_api(subject_code):
    """
    驗證必填欄位 API
    
    GET /validate-required-fields/P010002
    
    回應格式:
    {
        "success": true,
        "message": "所有必填欄位已完成"
    }
    """
    try:
        result = edc_sys.validate_required_fields(subject_code, verbose=VERBOSE)
        
        if not result['success']:
            return jsonify({
                "success": False,
                "message": result['message'],
                "missing_fields": result.get('missing_fields', []),
                "error_code": result.get('error_code'),
                "content": "validate_required_fields"
            }), 200  # 驗證失敗也返回200，因為這是正常的業務邏輯
        
        return jsonify({
            "success": True,
            "message": result['message']
        })
        
    except Exception as e:
        logging.error(f"驗證必填欄位失敗: {e}")
        return jsonify({
            "success": False,
            "message": f"驗證失敗: {str(e)}",
            "content": "validate_required_fields"
        }), 500

@edc_blueprints.route('/subject-history/<subject_code>', methods=['GET'])
@login_required
def get_subject_history(subject_code):
    """獲取受試者的歷程記錄"""
    try:
        result = edc_sys.get_subject_history(subject_code, verbose=VERBOSE)
        
        if result:
            return jsonify({
                'success': True,
                'data': result
            })
        else:
            return jsonify({
                'success': False,
                'message': '受試者不存在或無歷程記錄'
            }), 404
        
    except Exception as e:
        logging.error(f"獲取受試者歷程記錄失敗: {e}")
        return jsonify({
            'success': False,
            'message': f'獲取歷程記錄失敗: {str(e)}'
        }), 500
