/**
 * ComputerTech - Ứng dụng Quản lý Bán hàng, Kho & Bảo hành/Sửa chữa
 * Đơn vị tham khảo: Công ty Cổ phần Máy tính Biên Hòa
 */

// State toàn cục
const state = {
  currentUser: null,
  currentTab: 'dashboard',
  products: JSON.parse(localStorage.getItem('ct_products')) || INITIAL_PRODUCTS,
  customers: JSON.parse(localStorage.getItem('ct_customers')) || INITIAL_CUSTOMERS,
  orders: JSON.parse(localStorage.getItem('ct_orders')) || INITIAL_ORDERS,
  services: JSON.parse(localStorage.getItem('ct_services')) || INITIAL_SERVICES,
  stockLogs: JSON.parse(localStorage.getItem('ct_stock_logs')) || INITIAL_STOCK_LOGS
};

// Lưu dữ liệu vào LocalStorage
function saveData() {
  localStorage.setItem('ct_products', JSON.stringify(state.products));
  localStorage.setItem('ct_customers', JSON.stringify(state.customers));
  localStorage.setItem('ct_orders', JSON.stringify(state.orders));
  localStorage.setItem('ct_services', JSON.stringify(state.services));
  localStorage.setItem('ct_stock_logs', JSON.stringify(state.stockLogs));
}

// Format tiền tệ VNĐ
function formatVND(amount) {
  return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);
}

// Toast thông báo
function showToast(message, type = 'success') {
  const container = document.getElementById('toastContainer');
  if (!container) return;
  const toast = document.createElement('div');
  toast.className = `toast toast-${type}`;
  toast.innerHTML = `
    <span>${type === 'success' ? '✓' : '⚠'}</span>
    <div>${message}</div>
  `;
  container.appendChild(toast);
  setTimeout(() => {
    toast.style.opacity = '0';
    toast.style.transform = 'translateY(10px)';
    setTimeout(() => toast.remove(), 300);
  }, 3500);
}

// Khởi chạy ứng dụng
document.addEventListener('DOMContentLoaded', () => {
  const savedUserId = localStorage.getItem('ct_current_user_id');
  if (savedUserId) {
    const user = DEMO_USERS.find(u => u.id === savedUserId);
    if (user) {
      setCurrentUser(user);
      return;
    }
  }
  // Nếu chưa đăng nhập thì hiện màn hình đăng nhập
  showLoginView();
});

// Đăng nhập
function setCurrentUser(user) {
  state.currentUser = user;
  localStorage.setItem('ct_current_user_id', user.id);
  
  document.getElementById('loginView').style.display = 'none';
  document.getElementById('appView').style.display = 'flex';
  
  // Cập nhật giao diện Header & Sidebar theo người dùng
  updateUserUI();
  
  // Mở tab mặc định
  navigate('dashboard');
  showToast(`Xin chào ${user.name} (${user.roleTitle})!`);
}

function handleLoginForm(e) {
  e.preventDefault();
  const username = document.getElementById('loginUsername').value.trim();
  const password = document.getElementById('loginPassword').value.trim();
  
  const user = DEMO_USERS.find(u => u.username === username && u.password === password);
  if (user) {
    setCurrentUser(user);
  } else {
    showToast('Tài khoản hoặc mật khẩu không chính xác! Hãy dùng các nút thử nhanh.', 'danger');
  }
}

function quickLogin(roleName) {
  const user = DEMO_USERS.find(u => u.role.toLowerCase() === roleName.toLowerCase());
  if (user) {
    setCurrentUser(user);
  }
}

function logout() {
  localStorage.removeItem('ct_current_user_id');
  state.currentUser = null;
  document.getElementById('appView').style.display = 'none';
  showLoginView();
  showToast('Đã đăng xuất an toàn khỏi hệ thống.');
}

function showLoginView() {
  document.getElementById('appView').style.display = 'none';
  document.getElementById('loginView').style.display = 'flex';
}

function switchRole(roleId) {
  const user = DEMO_USERS.find(u => u.id === roleId);
  if (user) {
    setCurrentUser(user);
  }
}

// Cập nhật UI người dùng
function updateUserUI() {
  if (!state.currentUser) return;
  const u = state.currentUser;
  
  // Sidebar info
  document.getElementById('sidebarUserAvatar').textContent = u.avatar;
  document.getElementById('sidebarUserAvatar').style.backgroundColor = u.avatarBg;
  document.getElementById('sidebarUserName').textContent = u.name;
  document.getElementById('sidebarUserRole').textContent = u.roleTitle;
  
  // Topbar info
  const rolePill = document.getElementById('topRolePill');
  rolePill.textContent = u.roleTitle;
  rolePill.className = `role-pill role-${u.role.replace(/\s+/g, '-')}`;
  
  // Role switcher dropdown
  const switcher = document.getElementById('roleSwitcher');
  switcher.innerHTML = DEMO_USERS.map(demo => 
    `<option value="${demo.id}" ${demo.id === u.id ? 'selected' : ''}>Vai trò: ${demo.roleTitle} (${demo.name})</option>`
  ).join('');
}

// Phân quyền theo vai trò
function checkPermission(tab) {
  const role = state.currentUser ? state.currentUser.role : '';
  if (role === 'Admin') return true;
  
  if (tab === 'nhanvien') {
    // Chỉ Admin mới được vào Quản lý nhân viên & Phân quyền
    return false;
  }
  if (tab === 'baocao' && (role === 'Kho' || role === 'Kỹ thuật')) {
    return false;
  }
  return true;
}

// Điều hướng tab
function navigate(tab) {
  // Kiểm tra phân quyền
  if (!checkPermission(tab)) {
    renderForbidden(tab);
    return;
  }
  
  state.currentTab = tab;
  
  // Update sidebar active
  document.querySelectorAll('.nav-item').forEach(el => {
    el.classList.toggle('active', el.dataset.tab === tab);
  });
  
  // Update Page Title
  const titles = {
    dashboard: `Tổng quan ${state.currentUser.roleTitle}`,
    donhang: 'Quản lý đơn hàng',
    kho: 'Quản lý tồn kho & Xuất nhập',
    khachhang: 'Quản lý khách hàng',
    sanpham: 'Danh mục sản phẩm & Linh kiện',
    suachua: 'Bảo hành & Sửa chữa thiết bị',
    baocao: 'Báo cáo thống kê & Doanh số',
    nhanvien: 'Nhân viên & Ma trận phân quyền'
  };
  document.getElementById('pageTitle').textContent = titles[tab] || 'Hệ thống ComputerTech';
  
  // Render content
  const container = document.getElementById('mainContentBody');
  switch(tab) {
    case 'dashboard': renderDashboard(container); break;
    case 'donhang': renderOrders(container); break;
    case 'kho': renderInventory(container); break;
    case 'khachhang': renderCustomers(container); break;
    case 'sanpham': renderProducts(container); break;
    case 'suachua': renderServices(container); break;
    case 'baocao': renderReports(container); break;
    case 'nhanvien': renderEmployees(container); break;
    default: renderDashboard(container);
  }
}

// Màn hình 403 Forbidden
function renderForbidden(tab) {
  const container = document.getElementById('mainContentBody');
  document.getElementById('pageTitle').textContent = '403 — Không có quyền truy cập';
  container.innerHTML = `
    <div class="card forbidden-screen">
      <div class="forbidden-icon">🚫</div>
      <h2 class="forbidden-title">Không đủ quyền truy cập phân hệ này</h2>
      <p class="forbidden-desc">
        Tài khoản <strong>${state.currentUser.name}</strong> với vai trò <strong>${state.currentUser.roleTitle}</strong> 
        không được cấp quyền truy cập chức năng này theo chính sách bảo mật nội bộ của ComputerTech.
      </p>
      <div style="display: flex; gap: 12px; justify-content: center;">
        <button class="btn btn-primary" onclick="navigate('dashboard')">
          ← Về trang tổng quan ${state.currentUser.roleTitle}
        </button>
        <button class="btn btn-secondary" onclick="quickLogin('admin')">
          Chuyển sang tài khoản Admin để thử
        </button>
      </div>
    </div>
  `;
}

// 1. RENDER DASHBOARD
function renderDashboard(container) {
  const totalRev = state.orders.reduce((sum, o) => sum + (o.statusCode === 'COMPLETED' ? o.totalAmount : 0), 0);
  const totalOrders = state.orders.length;
  const totalAvailStock = state.products.reduce((sum, p) => sum + p.stockAvailable, 0);
  const activeServices = state.services.filter(s => s.currentStep < 6).length;
  
  container.innerHTML = `
    <!-- KPI CARDS -->
    <div class="kpi-grid">
      <div class="kpi-card">
        <div>
          <div class="kpi-title">TỔNG DOANH THU</div>
          <div class="kpi-value">${formatVND(totalRev)}</div>
          <div class="kpi-sub up">↑ +14.8% so với tháng trước</div>
        </div>
        <div class="kpi-icon-wrap kpi-icon-blue">💰</div>
      </div>
      <div class="kpi-card">
        <div>
          <div class="kpi-title">ĐƠN HÀNG TRONG THÁNG</div>
          <div class="kpi-value">${totalOrders} đơn</div>
          <div class="kpi-sub up">↑ 02 đơn mới hôm nay</div>
        </div>
        <div class="kpi-icon-wrap kpi-icon-green">📦</div>
      </div>
      <div class="kpi-card">
        <div>
          <div class="kpi-title">TỒN KHO KHẢ DỤNG</div>
          <div class="kpi-value">${totalAvailStock} sp</div>
          <div class="kpi-sub warning">⚠ 03 mặt hàng sắp hết</div>
        </div>
        <div class="kpi-icon-wrap kpi-icon-amber">🏭</div>
      </div>
      <div class="kpi-card">
        <div>
          <div class="kpi-title">ĐANG BẢO HÀNH / SỬA CHỮA</div>
          <div class="kpi-value">${activeServices} máy</div>
          <div class="kpi-sub neutral">01 máy sẵn sàng trả khách</div>
        </div>
        <div class="kpi-icon-wrap kpi-icon-purple">🛠</div>
      </div>
    </div>

    <!-- ROLE ACTION QUICK BANNER -->
    <div class="card" style="background: linear-gradient(135deg, #17365D 0%, #1e4b85 100%); color: white; padding: 18px 24px; margin-bottom: 24px;">
      <div style="display: flex; justify-content: space-between; align-items: center;">
        <div>
          <h3 style="font-size: 16px; font-weight: 700; margin-bottom: 4px;">
            Khu vực thao tác nghiệp vụ nhanh · Vai trò: ${state.currentUser.roleTitle}
          </h3>
          <p style="font-size: 13px; color: #CBD5E1;">
            ${state.currentUser.desc}
          </p>
        </div>
        <div style="display: flex; gap: 10px;">
          ${state.currentUser.role === 'Sale' || state.currentUser.role === 'Admin' ? `
            <button class="btn btn-primary" onclick="openCreateOrderModal()">+ Tạo đơn hàng</button>
            <button class="btn btn-secondary" onclick="openCreateServiceModal()">+ Tiếp nhận sửa chữa</button>
          ` : ''}
          ${state.currentUser.role === 'Kho' || state.currentUser.role === 'Admin' ? `
            <button class="btn btn-success" onclick="openStockImportModal()">+ Nhập hàng vào kho</button>
          ` : ''}
          ${state.currentUser.role === 'Kỹ thuật' || state.currentUser.role === 'Admin' ? `
            <button class="btn btn-warning" onclick="navigate('suachua')">Xem phiếu SC được giao</button>
          ` : ''}
        </div>
      </div>
    </div>

    <!-- BIỂU ĐỒ DOANH THU & HOẠT ĐỘNG GẦN ĐÂY -->
    <div style="display: grid; grid-template-columns: 2fr 1fr; gap: 20px; margin-bottom: 24px;">
      <div class="card">
        <div class="card-header">
          <div>
            <div class="card-title">Biểu đồ doanh thu 7 ngày gần nhất</div>
            <div class="card-subtitle">Đơn vị: Triệu VNĐ · Doanh thu bán hàng & dịch vụ sửa chữa</div>
          </div>
          <span class="badge badge-blue">Cập nhật 21/10/2026</span>
        </div>
        <div class="card-body" style="padding: 18px 24px;">
          <!-- SVG Bar Chart -->
          <svg viewBox="0 0 650 180" style="width: 100%; height: auto;">
            <!-- Grid Lines -->
            <line x1="40" y1="20" x2="630" y2="20" stroke="#E2E8F0" stroke-dasharray="3,3" />
            <line x1="40" y1="60" x2="630" y2="60" stroke="#E2E8F0" stroke-dasharray="3,3" />
            <line x1="40" y1="100" x2="630" y2="100" stroke="#E2E8F0" stroke-dasharray="3,3" />
            <line x1="40" y1="140" x2="630" y2="140" stroke="#CBD5E1" stroke-width="1.5" />
            
            <text x="10" y="24" fill="#94A3B8" font-size="11">60Tr</text>
            <text x="10" y="64" fill="#94A3B8" font-size="11">40Tr</text>
            <text x="10" y="104" fill="#94A3B8" font-size="11">20Tr</text>
            <text x="25" y="144" fill="#94A3B8" font-size="11">0</text>

            <!-- Bars -->
            <rect x="70" y="70" width="36" height="70" rx="4" fill="#2563EB" opacity="0.85" />
            <text x="75" y="160" fill="#64748B" font-size="11">15/10</text>
            <text x="72" y="62" fill="#1E293B" font-size="10" font-weight="600">32Tr</text>

            <rect x="150" y="55" width="36" height="85" rx="4" fill="#2563EB" opacity="0.85" />
            <text x="155" y="160" fill="#64748B" font-size="11">16/10</text>
            <text x="152" y="47" fill="#1E293B" font-size="10" font-weight="600">39Tr</text>

            <rect x="230" y="90" width="36" height="50" rx="4" fill="#2563EB" opacity="0.85" />
            <text x="235" y="160" fill="#64748B" font-size="11">17/10</text>
            <text x="232" y="82" fill="#1E293B" font-size="10" font-weight="600">24Tr</text>

            <rect x="310" y="40" width="36" height="100" rx="4" fill="#2563EB" opacity="0.85" />
            <text x="315" y="160" fill="#64748B" font-size="11">18/10</text>
            <text x="312" y="32" fill="#1E293B" font-size="10" font-weight="600">48Tr</text>

            <rect x="390" y="75" width="36" height="65" rx="4" fill="#2563EB" opacity="0.85" />
            <text x="395" y="160" fill="#64748B" font-size="11">19/10</text>
            <text x="392" y="67" fill="#1E293B" font-size="10" font-weight="600">29Tr</text>

            <rect x="470" y="50" width="36" height="90" rx="4" fill="#2563EB" opacity="0.85" />
            <text x="475" y="160" fill="#64748B" font-size="11">20/10</text>
            <text x="472" y="42" fill="#1E293B" font-size="10" font-weight="600">42Tr</text>

            <!-- Hôm nay nổi bật -->
            <rect x="550" y="30" width="36" height="110" rx="4" fill="#16A34A" />
            <text x="548" y="160" fill="#16A34A" font-size="11" font-weight="700">Hôm nay</text>
            <text x="552" y="22" fill="#16A34A" font-size="11" font-weight="700">54Tr</text>
          </svg>
        </div>
      </div>

      <div class="card">
        <div class="card-header">
          <div class="card-title">Cảnh báo tồn kho thấp</div>
          <span class="badge badge-danger">Cần bổ sung</span>
        </div>
        <div class="card-body" style="padding: 10px 18px;">
          ${state.products.filter(p => p.stockAvailable <= p.minAlert).map(p => `
            <div style="display: flex; justify-content: space-between; align-items: center; padding: 10px 0; border-bottom: 1px solid var(--border-color);">
              <div>
                <div style="font-size: 13px; font-weight: 600;">${p.name}</div>
                <div style="font-size: 11px; color: var(--text-muted);">SKU: ${p.sku} · Định mức tối thiểu: ${p.minAlert}</div>
              </div>
              <div style="text-align: right;">
                <span class="badge badge-danger">Còn ${p.stockAvailable} ${p.unit}</span>
                <div style="font-size: 11px; color: var(--primary-blue); cursor: pointer; margin-top: 4px;" onclick="openStockImportModal('${p.sku}')">
                  + Nhập ngay
                </div>
              </div>
            </div>
          `).join('')}
        </div>
      </div>
    </div>

    <!-- ĐƠN HÀNG VÀ PHIẾU SỬA CHỮA MỚI NHẤT -->
    <div class="card">
      <div class="card-header">
        <div>
          <div class="card-title">Đơn hàng phát sinh gần nhất</div>
          <div class="card-subtitle">Danh sách giao dịch theo thời gian thực</div>
        </div>
        <button class="btn btn-secondary" onclick="navigate('donhang')">Xem tất cả đơn →</button>
      </div>
      <div class="table-responsive">
        <table class="data-table">
          <thead>
            <tr>
              <th>Mã đơn</th>
              <th>Khách hàng</th>
              <th>Số điện thoại</th>
              <th>Thời gian</th>
              <th>Tổng tiền</th>
              <th>Trạng thái</th>
              <th>Nhân viên tạo</th>
            </tr>
          </thead>
          <tbody>
            ${state.orders.slice(0, 4).map(o => `
              <tr>
                <td><strong>#${o.id}</strong></td>
                <td>${o.customerName}</td>
                <td>${o.phone}</td>
                <td>${o.date}</td>
                <td><strong>${formatVND(o.totalAmount)}</strong></td>
                <td>
                  <span class="badge ${o.statusCode === 'COMPLETED' ? 'badge-success' : 'badge-blue'}">
                    ${o.status}
                  </span>
                </td>
                <td>${o.creator}</td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      </div>
    </div>
  `;
}

// 2. RENDER ĐƠN HÀNG (ORDERS)
function renderOrders(container) {
  container.innerHTML = `
    <div class="card">
      <div class="card-header">
        <div>
          <div class="card-title">Danh sách đơn hàng bán lẻ & dự án</div>
          <div class="card-subtitle">Quản lý kiểm tra tồn khả dụng trước khi xác nhận đơn</div>
        </div>
        <button class="btn btn-primary" onclick="openCreateOrderModal()">+ Tạo đơn hàng mới</button>
      </div>
      <div class="table-responsive">
        <table class="data-table">
          <thead>
            <tr>
              <th>Mã đơn</th>
              <th>Khách hàng</th>
              <th>Sản phẩm / Linh kiện</th>
              <th>Ngày tạo</th>
              <th>Tổng thanh toán</th>
              <th>Trạng thái</th>
              <th>Thao tác</th>
            </tr>
          </thead>
          <tbody>
            ${state.orders.map(o => `
              <tr>
                <td><strong>#${o.id}</strong></td>
                <td>
                  <div style="font-weight: 600;">${o.customerName}</div>
                  <div style="font-size: 11px; color: var(--text-muted);">${o.phone}</div>
                </td>
                <td>
                  ${o.items.map(it => `<div>• ${it.name} (SL: ${it.qty})</div>`).join('')}
                </td>
                <td>${o.date}</td>
                <td><strong style="color: var(--primary-blue);">${formatVND(o.totalAmount)}</strong></td>
                <td>
                  <span class="badge ${o.statusCode === 'COMPLETED' ? 'badge-success' : 'badge-warning'}">
                    ${o.status}
                  </span>
                </td>
                <td>
                  ${o.statusCode === 'CONFIRMED' ? `
                    <button class="btn btn-success" style="padding: 5px 10px; font-size: 12px;" onclick="completeOrder('${o.id}')">
                      Xuất kho & Hoàn tất
                    </button>
                  ` : `
                    <span style="font-size: 12px; color: var(--text-muted);">Đã giao hàng</span>
                  `}
                </td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      </div>
    </div>
  `;
}

// MODAL TẠO ĐƠN HÀNG (LUỒNG BÁN HÀNG & KIỂM SOÁT TỒN KHẢ DỤNG)
function openCreateOrderModal() {
  const modal = document.getElementById('appModal');
  const modalContent = document.getElementById('modalContent');
  
  modalContent.innerHTML = `
    <div class="modal-header">
      <h3>Tạo đơn hàng bán mới · Kiểm soát tồn kho</h3>
      <button class="modal-close" onclick="closeModal()">✕</button>
    </div>
    <div class="modal-body">
      <div class="form-group">
        <label>Chọn khách hàng:</label>
        <select class="form-control" id="orderCustomer">
          ${state.customers.map(c => `<option value="${c.name}|${c.phone}">${c.name} - ${c.phone} (${c.type})</option>`).join('')}
        </select>
      </div>

      <div class="form-group">
        <label>Chọn sản phẩm / Linh kiện:</label>
        <select class="form-control" id="orderProduct" onchange="checkOrderStock()">
          ${state.products.map(p => `
            <option value="${p.sku}" data-price="${p.price}" data-avail="${p.stockAvailable}" data-name="${p.name}">
              ${p.name} - Giá: ${formatVND(p.price)} (Tồn khả dụng: ${p.stockAvailable} ${p.unit})
            </option>
          `).join('')}
        </select>
      </div>

      <div class="form-group">
        <label>Số lượng đặt mua:</label>
        <input type="number" class="form-control" id="orderQty" value="1" min="1" oninput="checkOrderStock()" />
      </div>

      <!-- CẢNH BÁO TỒN KHO TỰ ĐỘNG -->
      <div id="stockAlertBox" style="display: none;" class="alert alert-danger">
        <strong>⚠ Không đủ tồn khả dụng!</strong>
        <div id="stockAlertMsg"></div>
      </div>

      <div class="card" style="background: var(--bg-light); padding: 14px; margin-top: 14px;">
        <div style="display: flex; justify-content: space-between; font-size: 14px; margin-bottom: 6px;">
          <span>Đơn giá niêm yết:</span>
          <span id="orderUnitPrice" style="font-weight: 600;">0 đ</span>
        </div>
        <div style="display: flex; justify-content: space-between; font-size: 16px; font-weight: 700; color: var(--primary-navy);">
          <span>Tổng tiền thanh toán:</span>
          <span id="orderTotalAmount" style="color: var(--primary-blue);">0 đ</span>
        </div>
      </div>
    </div>
    <div class="modal-footer">
      <button class="btn btn-secondary" onclick="closeModal()">Hủy</button>
      <button class="btn btn-primary" id="btnSubmitOrder" onclick="submitCreateOrder()">Xác nhận tạo đơn</button>
    </div>
  `;
  
  modal.classList.add('open');
  checkOrderStock();
}

function checkOrderStock() {
  const prodSelect = document.getElementById('orderProduct');
  const qtyInput = document.getElementById('orderQty');
  const alertBox = document.getElementById('stockAlertBox');
  const alertMsg = document.getElementById('stockAlertMsg');
  const btnSubmit = document.getElementById('btnSubmitOrder');
  
  if (!prodSelect || !qtyInput) return;
  
  const selectedOpt = prodSelect.options[prodSelect.selectedIndex];
  const price = parseFloat(selectedOpt.dataset.price);
  const avail = parseInt(selectedOpt.dataset.avail);
  const name = selectedOpt.dataset.name;
  const qty = parseInt(qtyInput.value) || 0;
  
  document.getElementById('orderUnitPrice').textContent = formatVND(price);
  document.getElementById('orderTotalAmount').textContent = formatVND(price * qty);
  
  // Kiểm tra tồn khả dụng
  if (qty > avail) {
    alertBox.style.display = 'block';
    alertMsg.textContent = `Sản phẩm "${name}" chỉ còn khả dụng ${avail} sản phẩm trong kho. Bạn đang yêu cầu ${qty} sản phẩm. Hãy giảm số lượng hoặc thông báo Thủ kho nhập thêm!`;
    btnSubmit.disabled = true;
    btnSubmit.style.opacity = '0.5';
    btnSubmit.style.cursor = 'not-allowed';
  } else {
    alertBox.style.display = 'none';
    btnSubmit.disabled = false;
    btnSubmit.style.opacity = '1';
    btnSubmit.style.cursor = 'pointer';
  }
}

function submitCreateOrder() {
  const prodSelect = document.getElementById('orderProduct');
  const qtyInput = document.getElementById('orderQty');
  const custSelect = document.getElementById('orderCustomer');
  
  const sku = prodSelect.value;
  const qty = parseInt(qtyInput.value);
  const [custName, custPhone] = custSelect.value.split('|');
  
  const product = state.products.find(p => p.sku === sku);
  if (!product || qty > product.stockAvailable) {
    showToast('Không đủ tồn khả dụng để tạo đơn hàng!', 'danger');
    return;
  }
  
  // Trừ tồn khả dụng và chuyển sang tồn đã giữ
  product.stockAvailable -= qty;
  product.stockHeld += qty;
  
  const orderId = `DH${String(state.orders.length + 1).padStart(3, '0')}`;
  const now = new Date();
  const dateStr = `${now.getDate()}/${now.getMonth() + 1}/${now.getFullYear()} ${now.getHours()}:${String(now.getMinutes()).padStart(2, '0')}`;
  
  const newOrder = {
    id: orderId,
    customerName: custName,
    phone: custPhone,
    date: dateStr,
    items: [{ sku: product.sku, name: product.name, qty: qty, price: product.price }],
    totalAmount: product.price * qty,
    status: 'Đã xác nhận',
    statusCode: 'CONFIRMED',
    creator: state.currentUser.name,
    notes: 'Đã giữ hàng trong kho, chờ khách thanh toán và xuất kho'
  };
  
  state.orders.unshift(newOrder);
  
  // Ghi nhật ký kho giữ hàng
  state.stockLogs.unshift({
    id: `GD${String(state.stockLogs.length + 1).padStart(3, '0')}`,
    date: dateStr,
    type: 'GIỮ HÀNG ĐƠN MỚI',
    typeClass: 'badge-warning',
    sku: product.sku,
    productName: product.name,
    qty: -qty,
    reference: `Đơn hàng #${orderId}`,
    operator: state.currentUser.name,
    note: `Tạm giữ ${qty} cái cho khách ${custName}`
  });
  
  saveData();
  closeModal();
  navigate('donhang');
  showToast(`Đã tạo thành công đơn hàng #${orderId}! Kho đã chuyển ${qty} sản phẩm sang trạng thái Giữ hàng.`);
}

function completeOrder(orderId) {
  const order = state.orders.find(o => o.id === orderId);
  if (!order) return;
  
  // Trừ tồn thực tế và tồn đã giữ
  order.items.forEach(it => {
    const prod = state.products.find(p => p.sku === it.sku);
    if (prod) {
      prod.stockActual -= it.qty;
      prod.stockHeld -= it.qty;
    }
  });
  
  order.status = 'Hoàn tất';
  order.statusCode = 'COMPLETED';
  
  const now = new Date();
  const dateStr = `${now.getDate()}/${now.getMonth() + 1}/${now.getFullYear()} ${now.getHours()}:${String(now.getMinutes()).padStart(2, '0')}`;
  
  state.stockLogs.unshift({
    id: `GD${String(state.stockLogs.length + 1).padStart(3, '0')}`,
    date: dateStr,
    type: 'XUẤT KHO HOÀN TẤT',
    typeClass: 'badge-danger',
    sku: order.items[0].sku,
    productName: order.items[0].name,
    qty: -order.items[0].qty,
    reference: `Đơn hàng #${order.id}`,
    operator: state.currentUser.name,
    note: `Khách hàng đã nhận máy và thanh toán hoàn tất.`
  });
  
  saveData();
  navigate('donhang');
  showToast(`Đơn hàng #${orderId} đã được xuất kho và hoàn tất thành công!`);
}

// 3. RENDER KHO HÀNG (INVENTORY)
function renderInventory(container) {
  container.innerHTML = `
    <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px;">
      <div>
        <h2 style="font-size: 20px; font-weight: 700;">Quản lý kho hàng & Luân chuyển linh kiện</h2>
        <p style="font-size: 13px; color: var(--text-muted);">
          Công thức kiểm soát: Tồn khả dụng = Tồn thực tế trong kho - Tồn đã giữ cho các đơn hàng
        </p>
      </div>
      <div style="display: flex; gap: 10px;">
        <button class="btn btn-success" onclick="openStockImportModal()">+ Nhập hàng mới</button>
      </div>
    </div>

    <div class="card">
      <div class="card-header">
        <div class="card-title">Bảng theo dõi tồn kho 3 trạng thái (Chuẩn ERP)</div>
      </div>
      <div class="table-responsive">
        <table class="data-table">
          <thead>
            <tr>
              <th>Mã SKU</th>
              <th>Tên linh kiện / Sản phẩm</th>
              <th>Danh mục</th>
              <th>Tồn thực tế</th>
              <th>Tồn đã giữ (Orders)</th>
              <th>Tồn khả dụng bán</th>
              <th>Trạng thái</th>
              <th>Thao tác</th>
            </tr>
          </thead>
          <tbody>
            ${state.products.map(p => `
              <tr>
                <td><code>${p.sku}</code></td>
                <td><strong>${p.name}</strong></td>
                <td><span class="badge badge-secondary">${p.category}</span></td>
                <td><strong style="font-size: 15px;">${p.stockActual}</strong> ${p.unit}</td>
                <td style="color: var(--warning); font-weight: 600;">${p.stockHeld} ${p.unit}</td>
                <td>
                  <strong style="font-size: 15px; color: ${p.stockAvailable <= p.minAlert ? 'var(--danger)' : 'var(--success)'};">
                    ${p.stockAvailable} ${p.unit}
                  </strong>
                </td>
                <td>
                  <span class="badge ${p.stockAvailable <= p.minAlert ? 'badge-danger' : 'badge-success'}">
                    ${p.stockAvailable <= p.minAlert ? 'Sắp hết hàng' : 'Đủ hàng'}
                  </span>
                </td>
                <td>
                  <button class="btn btn-secondary" style="padding: 4px 10px; font-size: 12px;" onclick="openStockImportModal('${p.sku}')">
                    + Nhập thêm
                  </button>
                </td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      </div>
    </div>

    <!-- LỊCH SỬ GIAO DỊCH KHO -->
    <div class="card">
      <div class="card-header">
        <div class="card-title">Lịch sử giao dịch xuất - nhập kho gần đây</div>
      </div>
      <div class="table-responsive">
        <table class="data-table">
          <thead>
            <tr>
              <th>Mã GD</th>
              <th>Thời gian</th>
              <th>Loại giao dịch</th>
              <th>SKU / Sản phẩm</th>
              <th>Số lượng biến động</th>
              <th>Chứng từ / Phiếu</th>
              <th>Người thực hiện</th>
              <th>Ghi chú</th>
            </tr>
          </thead>
          <tbody>
            ${state.stockLogs.map(log => `
              <tr>
                <td><strong>#${log.id}</strong></td>
                <td>${log.date}</td>
                <td><span class="badge ${log.typeClass}">${log.type}</span></td>
                <td><strong>${log.productName}</strong></td>
                <td>
                  <strong style="color: ${log.qty > 0 ? 'var(--success)' : 'var(--danger)'};">
                    ${log.qty > 0 ? `+${log.qty}` : log.qty}
                  </strong>
                </td>
                <td>${log.reference}</td>
                <td>${log.operator}</td>
                <td style="font-size: 12px; color: var(--text-secondary);">${log.note}</td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      </div>
    </div>
  `;
}

// MODAL NHẬP KHO
function openStockImportModal(targetSku = '') {
  const modal = document.getElementById('appModal');
  const modalContent = document.getElementById('modalContent');
  
  modalContent.innerHTML = `
    <div class="modal-header">
      <h3>Nhập hàng bổ sung vào kho ComputerTech</h3>
      <button class="modal-close" onclick="closeModal()">✕</button>
    </div>
    <div class="modal-body">
      <div class="form-group">
        <label>Chọn linh kiện / Sản phẩm nhập:</label>
        <select class="form-control" id="importProduct">
          ${state.products.map(p => `
            <option value="${p.sku}" ${p.sku === targetSku ? 'selected' : ''}>
              ${p.name} (Hiện có: ${p.stockActual} | Khả dụng: ${p.stockAvailable})
            </option>
          `).join('')}
        </select>
      </div>

      <div class="form-group">
        <label>Số lượng nhập thêm:</label>
        <input type="number" class="form-control" id="importQty" value="10" min="1" />
      </div>

      <div class="form-group">
        <label>Nhà cung cấp / Nguồn nhập:</label>
        <select class="form-control" id="importSupplier">
          <option>Synnex FPT - Tổng kho phân phối</option>
          <option>Viễn Sơn - Nhà phân phối chính hãng</option>
          <option>Dầu Khí Petrosetco (PSD)</option>
          <option>SPC Vinh Xuân</option>
        </select>
      </div>

      <div class="form-group">
        <label>Ghi chú / Lý do nhập:</label>
        <input type="text" class="form-control" id="importNote" value="Nhập hàng định kỳ bổ sung tồn kho tuần 4 tháng 10" />
      </div>
    </div>
    <div class="modal-footer">
      <button class="btn btn-secondary" onclick="closeModal()">Hủy</button>
      <button class="btn btn-success" onclick="submitStockImport()">Xác nhận nhập kho</button>
    </div>
  `;
  modal.classList.add('open');
}

function submitStockImport() {
  const sku = document.getElementById('importProduct').value;
  const qty = parseInt(document.getElementById('importQty').value) || 0;
  const supplier = document.getElementById('importSupplier').value;
  const note = document.getElementById('importNote').value;
  
  if (qty <= 0) {
    showToast('Số lượng nhập phải lớn hơn 0!', 'danger');
    return;
  }
  
  const product = state.products.find(p => p.sku === sku);
  if (!product) return;
  
  // Tăng tồn thực tế và tồn khả dụng
  product.stockActual += qty;
  product.stockAvailable += qty;
  
  const now = new Date();
  const dateStr = `${now.getDate()}/${now.getMonth() + 1}/${now.getFullYear()} ${now.getHours()}:${String(now.getMinutes()).padStart(2, '0')}`;
  
  state.stockLogs.unshift({
    id: `GD${String(state.stockLogs.length + 1).padStart(3, '0')}`,
    date: dateStr,
    type: 'NHẬP KHO BỔ SUNG',
    typeClass: 'badge-success',
    sku: product.sku,
    productName: product.name,
    qty: qty,
    reference: supplier,
    operator: state.currentUser.name,
    note: note
  });
  
  saveData();
  closeModal();
  navigate('kho');
  showToast(`Đã nhập kho thành công +${qty} ${product.unit} cho "${product.name}"!`);
}

// 4. RENDER BẢO HÀNH & SỬA CHỮA (QUY TRÌNH 6 BƯỚC)
function renderServices(container) {
  container.innerHTML = `
    <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px;">
      <div>
        <h2 style="font-size: 20px; font-weight: 700;">Quy trình Bảo hành & Sửa chữa thiết bị (6 Bước)</h2>
        <p style="font-size: 13px; color: var(--text-muted);">
          Tiếp nhận (Sale) → Chẩn đoán (Kỹ thuật) → Cấp linh kiện (Kho) → Sửa chữa → KCS Kiểm tra → Bàn giao (Sale)
        </p>
      </div>
      <button class="btn btn-primary" onclick="openCreateServiceModal()">+ Tiếp nhận thiết bị mới</button>
    </div>

    ${state.services.map(svc => `
      <div class="card" style="margin-bottom: 24px;">
        <div class="card-header">
          <div>
            <div style="display: flex; align-items: center; gap: 10px;">
              <span style="font-size: 16px; font-weight: 700;">Phiếu #${svc.id} · ${svc.device}</span>
              <span class="badge ${svc.currentStep === 6 ? 'badge-success' : 'badge-blue'}">${svc.status}</span>
            </div>
            <div class="card-subtitle">Khách hàng: <strong>${svc.customerName}</strong> (${svc.phone}) · Tiếp nhận: ${svc.intakeDate}</div>
          </div>
          <div>
            ${getServiceActionButtons(svc)}
          </div>
        </div>
        <div class="card-body">
          <!-- STEPPER 6 BƯỚC -->
          <div class="stepper-container">
            <div class="step-item ${svc.currentStep >= 1 ? (svc.currentStep > 1 ? 'completed' : 'active') : ''}">
              <div class="step-circle">${svc.currentStep > 1 ? '✓' : '1'}</div>
              <div class="step-title">1. Tiếp nhận (Sale)</div>
            </div>
            <div class="step-item ${svc.currentStep >= 2 ? (svc.currentStep > 2 ? 'completed' : 'active') : ''}">
              <div class="step-circle">${svc.currentStep > 2 ? '✓' : '2'}</div>
              <div class="step-title">2. Chẩn đoán</div>
            </div>
            <div class="step-item ${svc.currentStep >= 3 ? (svc.currentStep > 3 ? 'completed' : 'active') : ''}">
              <div class="step-circle">${svc.currentStep > 3 ? '✓' : '3'}</div>
              <div class="step-title">3. Cấp linh kiện (Kho)</div>
            </div>
            <div class="step-item ${svc.currentStep >= 4 ? (svc.currentStep > 4 ? 'completed' : 'active') : ''}">
              <div class="step-circle">${svc.currentStep > 4 ? '✓' : '4'}</div>
              <div class="step-title">4. Đang sửa</div>
            </div>
            <div class="step-item ${svc.currentStep >= 5 ? (svc.currentStep > 5 ? 'completed' : 'active') : ''}">
              <div class="step-circle">${svc.currentStep > 5 ? '✓' : '5'}</div>
              <div class="step-title">5. KCS Kiểm tra</div>
            </div>
            <div class="step-item ${svc.currentStep >= 6 ? 'completed' : ''}">
              <div class="step-circle">${svc.currentStep >= 6 ? '✓' : '6'}</div>
              <div class="step-title">6. Bàn giao khách (Sale)</div>
            </div>
          </div>

          <!-- CHI TIẾT PHIẾU -->
          <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 16px; background: var(--bg-light); padding: 16px; border-radius: 8px;">
            <div>
              <div style="font-size: 11px; color: var(--text-muted); font-weight: 600;">LỖI KHÁCH MÔ TẢ</div>
              <div style="font-size: 13px; font-weight: 500; margin-top: 4px;">${svc.reportedFault}</div>
              <div style="font-size: 12px; color: var(--text-secondary); margin-top: 4px;">Phụ kiện: ${svc.accessories}</div>
            </div>
            <div>
              <div style="font-size: 11px; color: var(--text-muted); font-weight: 600;">KẾT QUẢ CHẨN ĐOÁN & LINH KIỆN</div>
              <div style="font-size: 13px; font-weight: 500; margin-top: 4px;">${svc.diagnosis}</div>
              ${svc.requiredPart ? `
                <div style="margin-top: 6px;">
                  <span class="badge badge-warning">Linh kiện: ${svc.requiredPart.name}</span>
                  <div style="font-size: 12px; margin-top: 2px;">Trạng thái cấp: <strong>${svc.partRequestStatus}</strong></div>
                </div>
              ` : '<div style="font-size: 12px; color: var(--text-muted); margin-top: 4px;">Không cần thay linh kiện</div>'}
            </div>
            <div>
              <div style="font-size: 11px; color: var(--text-muted); font-weight: 600;">NHÂN SỰ XỬ LÝ & CHI PHÍ</div>
              <div style="font-size: 13px; margin-top: 4px;">Sale tiếp nhận: <strong>${svc.intakeStaff}</strong></div>
              <div style="font-size: 13px;">Kỹ thuật viên: <strong>${svc.technician}</strong></div>
              <div style="font-size: 14px; font-weight: 700; color: var(--primary-blue); margin-top: 4px;">
                Tổng chi phí: ${formatVND(svc.totalCost)}
              </div>
            </div>
          </div>
        </div>
      </div>
    `).join('')}
  `;
}

function getServiceActionButtons(svc) {
  const role = state.currentUser ? state.currentUser.role : '';
  
  if (svc.currentStep === 1) {
    return `<button class="btn btn-warning" onclick="advanceStep('${svc.id}', 2)">Bắt đầu chẩn đoán lỗi →</button>`;
  }
  if (svc.currentStep === 2) {
    return `<button class="btn btn-warning" onclick="advanceStep('${svc.id}', 3)">Yêu cầu linh kiện từ Kho →</button>`;
  }
  if (svc.currentStep === 3) {
    return `
      <button class="btn btn-success" onclick="approvePart('${svc.id}')">
        Kho duyệt cấp linh kiện →
      </button>
    `;
  }
  if (svc.currentStep === 4) {
    return `<button class="btn btn-primary" onclick="advanceStep('${svc.id}', 5)">Kỹ thuật hoàn thành → KCS test</button>`;
  }
  if (svc.currentStep === 5) {
    return `
      <button class="btn btn-success" onclick="advanceStep('${svc.id}', 6)">
        KCS đạt chuẩn → Chuyển Sale bàn giao khách
      </button>
    `;
  }
  return `<span class="badge badge-success" style="padding: 6px 12px;">✓ Đã hoàn tất và trả khách</span>`;
}

function advanceStep(serviceId, nextStep) {
  const svc = state.services.find(s => s.id === serviceId);
  if (!svc) return;
  
  svc.currentStep = nextStep;
  const stepStatus = {
    2: 'Đang chẩn đoán',
    3: 'Chờ linh kiện',
    4: 'Đang sửa chữa',
    5: 'Sẵn sàng bàn giao',
    6: 'Đã trả khách'
  };
  svc.status = stepStatus[nextStep] || svc.status;
  
  saveData();
  navigate('suachua');
  showToast(`Phiếu #${serviceId} đã được chuyển sang bước ${nextStep}: ${svc.status}!`);
}

function approvePart(serviceId) {
  const svc = state.services.find(s => s.id === serviceId);
  if (!svc || !svc.requiredPart) return;
  
  const product = state.products.find(p => p.sku === svc.requiredPart.sku);
  if (product) {
    if (product.stockAvailable < svc.requiredPart.qty) {
      showToast(`Kho không đủ linh kiện ${product.name} khả dụng để cấp! Hãy nhập thêm.`, 'danger');
      return;
    }
    // Trừ kho
    product.stockActual -= svc.requiredPart.qty;
    product.stockAvailable -= svc.requiredPart.qty;
  }
  
  svc.partRequestStatus = 'Đã duyệt & xuất cấp';
  svc.currentStep = 4;
  svc.status = 'Đang sửa chữa';
  
  const now = new Date();
  const dateStr = `${now.getDate()}/${now.getMonth() + 1}/${now.getFullYear()} ${now.getHours()}:${String(now.getMinutes()).padStart(2, '0')}`;
  
  state.stockLogs.unshift({
    id: `GD${String(state.stockLogs.length + 1).padStart(3, '0')}`,
    date: dateStr,
    type: 'CẤP LINH KIỆN SC',
    typeClass: 'badge-warning',
    sku: svc.requiredPart.sku,
    productName: svc.requiredPart.name,
    qty: -svc.requiredPart.qty,
    reference: `Phiếu SC #${svc.id}`,
    operator: state.currentUser.name,
    note: `Thủ kho đã duyệt cấp linh kiện cho Kỹ thuật viên ${svc.technician}`
  });
  
  saveData();
  navigate('suachua');
  showToast(`Thủ kho đã duyệt cấp ${svc.requiredPart.name} cho Phiếu #${serviceId}! Kỹ thuật bắt đầu sửa.`);
}

function openCreateServiceModal() {
  const modal = document.getElementById('appModal');
  const modalContent = document.getElementById('modalContent');
  
  modalContent.innerHTML = `
    <div class="modal-header">
      <h3>Tiếp nhận thiết bị bảo hành / sửa chữa mới (Sale)</h3>
      <button class="modal-close" onclick="closeModal()">✕</button>
    </div>
    <div class="modal-body">
      <div class="form-group">
        <label>Khách hàng:</label>
        <select class="form-control" id="svcCust">
          ${state.customers.map(c => `<option value="${c.name}|${c.phone}">${c.name} - ${c.phone}</option>`).join('')}
        </select>
      </div>
      <div class="form-group">
        <label>Tên thiết bị & Serial:</label>
        <input type="text" class="form-control" id="svcDevice" placeholder="VD: Laptop Acer Nitro 5 (Serial: AC-8821)" required />
      </div>
      <div class="form-group">
        <label>Tình trạng lỗi do khách mô tả:</label>
        <textarea class="form-control" id="svcFault" rows="2" placeholder="VD: Bật không lên nguồn, cắm sạc đèn không sáng..."></textarea>
      </div>
      <div class="form-group">
        <label>Phụ kiện kèm theo & Ngoại quan:</label>
        <input type="text" class="form-control" id="svcAccessories" value="Sạc zin theo máy · Thân máy nguyên vẹn" />
      </div>
      <div class="form-group">
        <label>Phân công kỹ thuật viên chẩn đoán:</label>
        <select class="form-control" id="svcTech">
          <option value="Đỗ Anh Tuấn">Đỗ Anh Tuấn (Chuyên phần cứng & Laptop)</option>
          <option value="Nguyễn Văn Minh">Nguyễn Văn Minh (Chuyên VGA & Nguồn)</option>
        </select>
      </div>
    </div>
    <div class="modal-footer">
      <button class="btn btn-secondary" onclick="closeModal()">Hủy</button>
      <button class="btn btn-primary" onclick="submitCreateService()">Xác nhận tiếp nhận</button>
    </div>
  `;
  modal.classList.add('open');
}

function submitCreateService() {
  const [custName, custPhone] = document.getElementById('svcCust').value.split('|');
  const device = document.getElementById('svcDevice').value.trim();
  const fault = document.getElementById('svcFault').value.trim();
  const accessories = document.getElementById('svcAccessories').value.trim();
  const tech = document.getElementById('svcTech').value;
  
  if (!device || !fault) {
    showToast('Vui lòng nhập tên thiết bị và tình trạng lỗi!', 'danger');
    return;
  }
  
  const now = new Date();
  const dateStr = `${now.getDate()}/${now.getMonth() + 1}/${now.getFullYear()} ${now.getHours()}:${String(now.getMinutes()).padStart(2, '0')}`;
  const svcId = `SC${String(state.services.length + 1).padStart(3, '0')}`;
  
  state.services.unshift({
    id: svcId,
    customerName: custName,
    phone: custPhone,
    device: device,
    reportedFault: fault,
    accessories: accessories,
    intakeDate: dateStr,
    targetDate: '24/10/2026 17:00',
    intakeStaff: state.currentUser.name,
    technician: tech,
    diagnosis: 'Chờ kỹ thuật viên kiểm tra phần cứng',
    requiredPart: null,
    partRequestStatus: 'Chưa có',
    currentStep: 1,
    status: 'Tiếp nhận mới',
    statusCode: 'INTAKE',
    kcsPassed: false,
    totalCost: 0,
    notes: 'Sale đã in biên nhận bàn giao cho khách hàng'
  });
  
  saveData();
  closeModal();
  navigate('suachua');
  showToast(`Đã tạo phiếu tiếp nhận #${svcId} thành công cho khách ${custName}!`);
}

// 5. RENDER KHÁCH HÀNG
function renderCustomers(container) {
  container.innerHTML = `
    <div class="card">
      <div class="card-header">
        <div>
          <div class="card-title">Danh sách khách hàng ComputerTech</div>
          <div class="card-subtitle">Theo dõi lịch sử đơn hàng và lịch sử bảo hành thiết bị</div>
        </div>
      </div>
      <div class="table-responsive">
        <table class="data-table">
          <thead>
            <tr>
              <th>Mã KH</th>
              <th>Họ và tên</th>
              <th>Số điện thoại</th>
              <th>Email</th>
              <th>Địa chỉ</th>
              <th>Phân loại</th>
              <th>Tổng chi tiêu</th>
            </tr>
          </thead>
          <tbody>
            ${state.customers.map(c => `
              <tr>
                <td><strong>#${c.id}</strong></td>
                <td><strong>${c.name}</strong></td>
                <td>${c.phone}</td>
                <td>${c.email}</td>
                <td>${c.address}</td>
                <td><span class="badge badge-blue">${c.type}</span></td>
                <td><strong style="color: var(--primary-blue);">${formatVND(c.totalSpent)}</strong></td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      </div>
    </div>
  `;
}

// 6. RENDER SẢN PHẨM
function renderProducts(container) {
  container.innerHTML = `
    <div class="card">
      <div class="card-header">
        <div>
          <div class="card-title">Danh mục sản phẩm & Linh kiện máy tính</div>
          <div class="card-subtitle">Quản lý mã SKU, giá bán lẻ niêm yết và thời hạn bảo hành</div>
        </div>
      </div>
      <div class="table-responsive">
        <table class="data-table">
          <thead>
            <tr>
              <th>Mã SKU</th>
              <th>Tên sản phẩm</th>
              <th>Phân loại</th>
              <th>Giá bán niêm yết</th>
              <th>Bảo hành</th>
              <th>Tồn khả dụng</th>
              <th>Tình trạng</th>
            </tr>
          </thead>
          <tbody>
            ${state.products.map(p => `
              <tr>
                <td><code>${p.sku}</code></td>
                <td><strong>${p.name}</strong></td>
                <td><span class="badge badge-secondary">${p.category}</span></td>
                <td><strong style="color: var(--primary-blue);">${formatVND(p.price)}</strong></td>
                <td>${p.warrantyMonths} tháng</td>
                <td><strong>${p.stockAvailable} ${p.unit}</strong></td>
                <td>
                  <span class="badge ${p.stockAvailable <= p.minAlert ? 'badge-danger' : 'badge-success'}">
                    ${p.status}
                  </span>
                </td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      </div>
    </div>
  `;
}

// 7. RENDER BÁO CÁO
function renderReports(container) {
  container.innerHTML = `
    <div class="card">
      <div class="card-header">
        <div class="card-title">Báo cáo hiệu quả kinh doanh & Dịch vụ bảo hành</div>
        <div class="card-subtitle">Tổng hợp số liệu từ Công ty Cổ phần Máy tính Biên Hòa</div>
      </div>
      <div class="card-body">
        <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 20px; margin-bottom: 24px;">
          <div style="background: var(--bg-light); padding: 18px; border-radius: 8px;">
            <div style="font-size: 13px; color: var(--text-muted);">Tỷ lệ giao hàng thành công</div>
            <div style="font-size: 26px; font-weight: 700; color: var(--success); margin: 6px 0;">98.4%</div>
            <div style="font-size: 12px; color: var(--text-muted);">Thời gian xử lý trung bình: 45 phút</div>
          </div>
          <div style="background: var(--bg-light); padding: 18px; border-radius: 8px;">
            <div style="font-size: 13px; color: var(--text-muted);">Tỷ lệ sửa chữa xong đúng hẹn</div>
            <div style="font-size: 26px; font-weight: 700; color: var(--primary-blue); margin: 6px 0;">94.2%</div>
            <div style="font-size: 12px; color: var(--text-muted);">Thời gian hoàn tất trung bình: 26 giờ</div>
          </div>
          <div style="background: var(--bg-light); padding: 18px; border-radius: 8px;">
            <div style="font-size: 13px; color: var(--text-muted);">Tỷ lệ quay đầu linh kiện kho</div>
            <div style="font-size: 26px; font-weight: 700; color: var(--warning); margin: 6px 0;">88.6%</div>
            <div style="font-size: 12px; color: var(--text-muted);">Đảm bảo không phát sinh tồn đọng quá 60 ngày</div>
          </div>
        </div>
        <p style="font-size: 13px; color: var(--text-muted);">
          * Toàn bộ dữ liệu hiển thị nhằm mục đích minh họa đồ án thiết kế hệ thống ComputerTech.
        </p>
      </div>
    </div>
  `;
}

// 8. RENDER NHÂN VIÊN & MA TRẬN PHÂN QUYỀN
function renderEmployees(container) {
  container.innerHTML = `
    <div class="card" style="margin-bottom: 24px;">
      <div class="card-header">
        <div>
          <div class="card-title">Danh sách 4 tài khoản nhân sự hệ thống</div>
          <div class="card-subtitle">Bao gồm 4 vai trò chính đã được tạo sẵn để kiểm thử</div>
        </div>
      </div>
      <div class="table-responsive">
        <table class="data-table">
          <thead>
            <tr>
              <th>Mã NV</th>
              <th>Họ và tên</th>
              <th>Tài khoản</th>
              <th>Mật khẩu thử</th>
              <th>Vai trò</th>
              <th>Phạm vi trách nhiệm</th>
              <th>Thao tác</th>
            </tr>
          </thead>
          <tbody>
            ${DEMO_USERS.map(u => `
              <tr>
                <td><strong>#${u.id}</strong></td>
                <td>
                  <div style="display: flex; align-items: center; gap: 8px;">
                    <span class="role-avatar" style="background: ${u.avatarBg};">${u.avatar}</span>
                    <strong>${u.name}</strong>
                  </div>
                </td>
                <td><code>${u.username}</code></td>
                <td><code>${u.password}</code></td>
                <td><span class="badge badge-blue">${u.roleTitle}</span></td>
                <td style="font-size: 12.5px; color: var(--text-secondary);">${u.desc}</td>
                <td>
                  <button class="btn btn-secondary" style="padding: 4px 10px; font-size: 12px;" onclick="switchRole('${u.id}')">
                    Đăng nhập vai này
                  </button>
                </td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      </div>
    </div>

    <!-- MA TRẬN PHÂN QUYỀN -->
    <div class="card">
      <div class="card-header">
        <div class="card-title">Ma trận phân quyền chi tiết (RBAC)</div>
        <div class="card-subtitle">Quyền thao tác của Admin, Sale, Kho và Kỹ thuật</div>
      </div>
      <div class="table-responsive">
        <table class="data-table">
          <thead>
            <tr>
              <th>Chức năng nghiệp vụ</th>
              <th style="text-align: center;">Quản trị viên (Admin)</th>
              <th style="text-align: center;">Bán hàng (Sale)</th>
              <th style="text-align: center;">Thủ kho (Kho)</th>
              <th style="text-align: center;">Kỹ thuật viên</th>
            </tr>
          </thead>
          <tbody>
            ${PERMISSIONS_MATRIX.map(m => `
              <tr>
                <td><strong>${m.module}</strong></td>
                <td style="text-align: center;">${m.admin ? '🟢 Cho phép' : '—'}</td>
                <td style="text-align: center;">${m.sale ? '🟢 Cho phép' : '❌ Chặn'}</td>
                <td style="text-align: center;">${m.kho ? '🟢 Cho phép' : '❌ Chặn'}</td>
                <td style="text-align: center;">${m.kythuat ? '🟢 Cho phép' : '❌ Chặn'}</td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      </div>
    </div>
  `;
}

// Đóng modal chung
function closeModal() {
  document.getElementById('appModal').classList.remove('open');
}
