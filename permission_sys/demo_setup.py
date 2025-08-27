"""
Permission System Demo Setup

初始化權限系統的示例資料，包括權限、角色和用戶分配
"""

import json
import logging
from permission_function import permission_db

logging.basicConfig(level=logging.INFO)

def setup_demo_permissions():
    """設置示例權限系統"""
    
    print("🚀 開始初始化權限系統...")
    
    # 創建權限資料庫實例
    perm_sys = permission_db()
    
    # 1. 初始化預設權限和角色
    print("📋 初始化預設權限和角色...")
    result = perm_sys.init_default_permissions_and_roles(verbose=True)
    print(f"✅ 結果: {result.get('message', 'Unknown')}")
    
    # 2. 檢查現有用戶
    print("\n👥 檢查現有用戶...")
    try:
        users_result = perm_sys.conn.search('user', informations='UNIQUE_ID,NAME,EMAIL', verbose=0)
        print(f"找到 {len(users_result['data'])} 個用戶:")
        
        for user_data in users_result['data']:
            unique_id, name, email = user_data
            print(f"  - {unique_id}: {name} ({email})")
    except Exception as e:
        print(f"❌ 獲取用戶資料失敗: {e}")
        return
    
    # 3. 為現有用戶分配角色
    print("\n🔐 為用戶分配角色...")
    
    # 示例分配 (根據您的實際用戶調整)
    user_role_assignments = [
        # ('用戶UNIQUE_ID', '角色名稱')
        ('KHH001', 'super_admin'),  # 假設第一個用戶是超級管理員
        ('KHH002', 'admin'),        # 第二個用戶是管理員
        ('KHH003', 'manager'),      # 第三個用戶是管理者
    ]
    
    for user_id, role_name in user_role_assignments:
        try:
            # 檢查用戶是否存在
            user_check = perm_sys.conn.search(
                'user', 
                criteria=f"UNIQUE_ID='{user_id}'",
                verbose=0
            )
            
            if user_check['data']:
                result = perm_sys.assign_user_role(
                    user_id=user_id,
                    role_name=role_name,
                    assigned_by='SYSTEM',
                    verbose=True
                )
                if result.get('success'):
                    print(f"✅ 已為用戶 {user_id} 分配角色 {role_name}")
                else:
                    print(f"⚠️ 用戶 {user_id} 角色分配結果: {result.get('message')}")
            else:
                print(f"❌ 用戶 {user_id} 不存在，跳過角色分配")
                
        except Exception as e:
            print(f"❌ 為用戶 {user_id} 分配角色 {role_name} 失敗: {e}")
    
    # 4. 給第一個用戶一些直接權限作為示例
    print("\n🎯 分配直接權限示例...")
    if users_result['data']:
        first_user_id = users_result['data'][0][0]
        
        direct_permissions = [
            'signin.admin',
            'leave.admin'
        ]
        
        for permission in direct_permissions:
            try:
                result = perm_sys.grant_direct_permission(
                    user_id=first_user_id,
                    permission=permission,
                    granted_by='SYSTEM',
                    verbose=True
                )
                if result.get('success'):
                    print(f"✅ 已為用戶 {first_user_id} 授予直接權限 {permission}")
                else:
                    print(f"⚠️ 直接權限授予結果: {result.get('message')}")
            except Exception as e:
                print(f"❌ 授予直接權限 {permission} 失敗: {e}")
    
    # 5. 測試權限檢查
    print("\n🧪 測試權限檢查...")
    if users_result['data']:
        test_user_id = users_result['data'][0][0]
        test_permissions = [
            'dashboard.view',
            'users.admin',
            'signin.create',
            'nonexistent.permission'
        ]
        
        for permission in test_permissions:
            try:
                check_result = perm_sys.check_user_permission(
                    user_id=test_user_id,
                    permission=permission,
                    verbose=False
                )
                
                status = "✅ 有權限" if check_result.get('has_permission') else "❌ 無權限"
                source = check_result.get('source', 'unknown')
                print(f"  {permission}: {status} (來源: {source})")
                
            except Exception as e:
                print(f"❌ 測試權限 {permission} 失敗: {e}")
    
    print("\n🎉 權限系統初始化完成！")
    print("🌐 您現在可以:")
    print("   1. 啟動主應用: python signed/main_with_permission.py")
    print("   2. 訪問權限控制台: http://localhost:8000/permission/dashboard")
    print("   3. 測試 API: http://localhost:8000/permission/check_permission")

def show_user_permissions():
    """顯示所有用戶的權限狀況"""
    print("\n📊 用戶權限總覽:")
    print("="*60)
    
    perm_sys = permission_db()
    
    try:
        users_result = perm_sys.conn.search('user', informations='UNIQUE_ID,NAME', verbose=0)
        
        for user_data in users_result['data']:
            user_id, name = user_data
            print(f"\n👤 用戶: {name} ({user_id})")
            
            # 獲取用戶權限
            permissions_result = perm_sys.get_user_all_permissions(user_id=user_id, verbose=False)
            
            if permissions_result.get('status') == 'success':
                roles = permissions_result.get('roles', [])
                permissions = permissions_result.get('permissions', [])
                direct_perms = permissions_result.get('direct_permissions', [])
                
                print(f"   角色: {', '.join([r['name'] for r in roles]) or '無'}")
                print(f"   直接權限: {', '.join(direct_perms) or '無'}")
                print(f"   總權限數: {len(permissions)}")
                
                # 顯示前幾個權限
                if permissions:
                    shown_perms = permissions[:5]
                    print(f"   權限示例: {', '.join(shown_perms)}")
                    if len(permissions) > 5:
                        print(f"   ... 還有 {len(permissions) - 5} 個權限")
            else:
                print(f"   ❌ 獲取權限失敗: {permissions_result.get('message')}")
    
    except Exception as e:
        print(f"❌ 顯示用戶權限失敗: {e}")

if __name__ == "__main__":
    print("🔐 Permission System Demo Setup")
    print("="*50)
    
    try:
        setup_demo_permissions()
        show_user_permissions()
        
        print("\n" + "="*50)
        print("✨ 設置完成！權限系統已準備就緒。")
        
    except Exception as e:
        print(f"❌ 設置過程發生錯誤: {e}")
        import traceback
        traceback.print_exc()