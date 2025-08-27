# Permission System (permission_sys)

統一權限管理系統，整合 Flask RBAC 系統與企業打卡系統。

## 📋 功能特色

- **統一權限管理** - 集中管理所有系統的權限
- **JSON 權限儲存** - 使用 JSON 欄位避免 SQL 關聯表
- **靈活的權限檢查** - 支援權限裝飾器和 API 檢查
- **完整審計日誌** - 記錄所有權限相關操作
- **多資料庫支援** - 支援 SQLite、MySQL、PostgreSQL
- **權限快取** - 提升權限檢查效能
- **跨系統整合** - 整合 RBAC 系統與企業打卡系統

## 🏗️ 系統架構

```
permission_sys/
├── __init__.py          # 模組初始化和導出
├── models.py            # 資料模型 (PermissionUser, PermissionRole 等)
├── service.py           # 核心業務邏輯 (PermissionService)
├── decorators.py        # 權限裝飾器 (@require_permission)
├── database.py          # 資料庫操作 (PermissionDatabase)
├── utils.py             # 工具類別 (快取、用戶對應等)
├── routes.py            # Flask 路由和 API
├── config.py            # 配置和預設權限定義
└── README.md            # 說明文檔
```

## 🚀 快速開始

### 1. 安裝和初始化

```python
from permission_sys import PermissionService
from permission_sys.decorators import init_permission_decorators
from permission_sys.routes import register_permission_routes

# 初始化權限服務
permission_service = PermissionService()

# 初始化裝飾器
init_permission_decorators(permission_service)

# 註冊路由
register_permission_routes(app, permission_service)
```

### 2. 使用權限裝飾器

```python
from permission_sys import require_permission, require_role

# 檢查特定權限
@app.route('/users/create')
@require_permission('users.create')
def create_user():
    return "建立用戶頁面"

# 檢查角色
@app.route('/admin/dashboard')
@require_role('admin')
def admin_dashboard():
    return "管理員控制台"

# API 模式 (返回 JSON 錯誤而不是重定向)
@app.route('/api/users')
@require_permission('users.view', api_mode=True)
def api_get_users():
    return jsonify({'users': []})
```

### 3. 程式化權限檢查

```python
from flask import session
from permission_sys import PermissionService

permission_service = PermissionService()

# 檢查當前用戶權限
user_id = session.get('user_id')
if permission_service.check_permission(user_id, 'users.edit'):
    # 用戶有編輯權限
    pass

# 獲取用戶所有權限
permissions = permission_service.get_user_permissions(user_id)
print(f"用戶權限: {permissions}")
```

## 🔧 配置

### 環境變數配置

```bash
# 資料庫配置
PERMISSION_DB_TYPE=sqlite
PERMISSION_DB_PATH=permission_system.db

# 快取配置
PERMISSION_CACHE_TTL=300
PERMISSION_CACHE_ENABLED=True

# 審計日誌配置
PERMISSION_AUDIT_ENABLED=True
PERMISSION_AUDIT_RETENTION=365
```

### 程式配置

```python
from permission_sys.config import PermissionConfig

# 獲取資料庫配置
db_config = PermissionConfig.get_database_config()

# 獲取快取配置
cache_config = PermissionConfig.get_cache_config()
```

## 📊 權限系統設計

### 權限命名規則

權限使用 `resource.action` 格式：

```
users.view      # 查看用戶
users.create    # 建立用戶
users.edit      # 編輯用戶
users.delete    # 刪除用戶
signin.create   # 簽到
leave.approve   # 審核請假
system.admin    # 系統管理員
```

### 角色定義

系統提供 5 個預設角色：

- **super_admin** - 超級管理員（所有權限）
- **admin** - 系統管理員（用戶、角色管理）
- **manager** - 管理者（部分管理權限）
- **employee** - 員工（基本操作權限）
- **readonly** - 只讀用戶（僅查看權限）

### 權限計算邏輯

用戶總權限 = 角色權限集合 + 直接分配權限集合

```python
# 範例：用戶擁有的有效權限
角色權限: ["users.view", "dashboard.view"]
直接權限: ["signin.admin"]
總權限: ["users.view", "dashboard.view", "signin.admin"]
```

## 🔌 與現有系統整合

### 整合 Flask RBAC 系統

```python
# 在您的 Flask app 中
from permission_sys import PermissionService

# 初始化權限服務，可以配置連接到現有資料庫
permission_service = PermissionService({
    'type': 'postgresql',
    'host': 'localhost',
    'database': 'your_rbac_db'
})

# 同步資料
permission_service.sync_with_rbac_system()
```

### 整合企業打卡系統

```python
# 在簽到系統中加入權限檢查
@app.route('/signin/submit')
@require_permission('signin.create')
def submit_signin():
    # 簽到邏輯
    pass

# 在請假系統中
@app.route('/leave/approve/<int:leave_id>')
@require_permission('leave.approve')
def approve_leave(leave_id):
    # 請假審核邏輯
    pass
```

## 📈 API 端點

### 權限檢查 API

```bash
# 檢查權限
POST /permission/api/check
{
  "user_id": 1,
  "permission": "users.create"
}

# 獲取用戶權限
GET /permission/api/user/1/permissions

# 分配角色
POST /permission/api/user/1/assign-role
{
  "role_id": 2
}

# 授予直接權限
POST /permission/api/user/1/grant-permission
{
  "permission": "signin.admin"
}
```

### 管理界面

- `/permission/dashboard` - 權限系統控制台
- `/permission/users` - 用戶管理
- `/permission/roles` - 角色管理
- `/permission/audit-logs` - 審計日誌查看

## 🔐 安全特性

1. **雙重驗證** - 身份驗證 + 權限檢查
2. **權限快取** - 避免重複資料庫查詢
3. **審計追蹤** - 完整的操作記錄
4. **失敗安全** - 權限檢查失敗時拒絕存取
5. **Session 管理** - 安全的 Session 處理

## 🎯 使用範例

### 基本權限檢查

```python
from permission_sys import require_permission

@app.route('/protected-resource')
@require_permission('resource.access')
def protected_resource():
    return "只有有權限的用戶可以看到這個內容"
```

### 多權限檢查

```python
from permission_sys.decorators import require_any_permission, require_all_permissions

# 只需要其中一個權限
@require_any_permission(['users.edit', 'users.admin'])
def edit_user():
    pass

# 需要所有權限
@require_all_permissions(['users.edit', 'audit.view'])
def advanced_user_edit():
    pass
```

### 可選權限

```python
from permission_sys.decorators import optional_permission
from flask import g

@optional_permission('users.admin')
def user_list():
    if g.has_users_admin_permission:
        # 顯示管理員功能
        pass
    else:
        # 顯示普通用戶功能
        pass
```

## 🛠️ 故障排除

### 常見問題

1. **權限檢查失敗**
   - 檢查用戶是否已登入
   - 確認權限名稱拼寫正確
   - 檢查用戶是否有對應角色或直接權限

2. **資料庫連接錯誤**
   - 檢查資料庫配置
   - 確認資料庫表已建立
   - 檢查連接權限

3. **快取問題**
   - 清除權限快取：`permission_service.cache.clear_all_cache()`
   - 檢查快取設定

### 除錯模式

```python
# 啟用除錯日誌
import logging
logging.basicConfig(level=logging.DEBUG)

# 檢查權限服務狀態
print(permission_service.cache.get_cache_stats())
```

## 📚 進階功能

### 自定義權限檢查

```python
def custom_permission_check(user_id, resource_id):
    # 自定義權限邏輯
    user = permission_service.get_user_by_id(user_id)
    # ... 複雜的權限計算
    return has_permission

# 在路由中使用
@app.route('/resource/<int:resource_id>')
def access_resource(resource_id):
    user_id = session.get('user_id')
    if not custom_permission_check(user_id, resource_id):
        abort(403)
    # 允許存取
```

### 權限繼承

```python
# 檢查權限階層
from permission_sys.utils import PermissionCalculator

calculator = PermissionCalculator()
has_permission = calculator.check_permission_hierarchy(
    'users.create',
    ['users.*', 'dashboard.view']  # users.* 包含 users.create
)
```

## 🤝 貢獻指南

1. 確保所有測試通過
2. 遵循現有的代碼風格
3. 更新相關文檔
4. 提交詳細的變更說明

## 📄 授權

此專案使用 MIT 授權條款。