/**
 * 云计算及算力网络 - 后台管理逻辑
 * 基于 GitHub Contents API，所有修改自动提交到 GitHub 云端
 */

var AdminApp = (function () {

  var currentTab = 'dashboard';
  var editMode = null;
  var editId = null;
  var confirmCallback = null;

  /* ===== 登录（连接 GitHub） ===== */
  function handleLogin() {
    var token = document.getElementById('gh-token').value.trim();
    var owner = document.getElementById('gh-owner').value.trim();
    var repo = document.getElementById('gh-repo').value.trim();
    var branch = document.getElementById('gh-branch').value.trim() || 'main';

    if (!token || !owner || !repo) {
      showLoginError('请填写 Token、仓库所有者和仓库名称');
      return;
    }

    setSyncStatus('正在连接 GitHub...');
    CCNData.setConfig(token, owner, repo, branch);

    CCNData.fetchData()
      .then(function () {
        showAdmin();
      })
      .catch(function (err) {
        showLoginError(err.message || '连接失败，请检查配置');
        CCNData.clearConfig();
        setSyncStatus('');
      });
  }

  function showLoginError(msg) {
    var err = document.getElementById('login-error');
    err.textContent = msg;
    err.classList.add('show');
    setTimeout(function () { err.classList.remove('show'); }, 5000);
  }

  function handleLogout() {
    CCNData.clearConfig();
    document.getElementById('admin-app').style.display = 'none';
    document.getElementById('login-page').style.display = 'flex';
    document.getElementById('gh-token').value = '';
    setSyncStatus('');
  }

  function showAdmin() {
    document.getElementById('login-page').style.display = 'none';
    document.getElementById('admin-app').style.display = 'block';
    setSyncStatus('已连接');
    renderDashboard();
    renderConfigInfo();
  }

  /* ===== Tab 切换 ===== */
  function switchTab(tab) {
    currentTab = tab;
    document.querySelectorAll('.tab-content').forEach(function (el) {
      el.style.display = 'none';
    });
    var target = document.getElementById('tab-' + tab);
    if (target) target.style.display = '';

    document.querySelectorAll('.sidebar-menu li a').forEach(function (a) {
      a.classList.remove('active');
    });
    var activeLink = document.querySelector('[data-tab="' + tab + '"]');
    if (activeLink) activeLink.classList.add('active');

    if (tab === 'dashboard') renderDashboard();
    if (tab === 'news') renderNewsTable();
    if (tab === 'projects') renderProjectsTable();
    if (tab === 'experts') renderExpertsTable();
  }

  /* ===== 控制台 ===== */
  function renderDashboard() {
    document.getElementById('stat-news').textContent = CCNData.getNews().length;
    document.getElementById('stat-projects').textContent = CCNData.getProjects().length;
    document.getElementById('stat-experts').textContent = CCNData.getExperts().length;
  }

  function renderConfigInfo() {
    var c = CCNData.getConfig();
    if (!c) return;
    var el = document.getElementById('gh-config-info');
    if (el) {
      el.textContent = '仓库: ' + c.owner + '/' + c.repo + '  |  分支: ' + c.branch;
    }
  }

  /* ===== GitHub 同步状态 ===== */
  function setSyncStatus(status) {
    var el = document.getElementById('sync-status');
    if (el) el.textContent = status;
  }

  function syncStart() {
    setSyncStatus('正在同步...');
  }

  function syncDone() {
    setSyncStatus('已同步 ' + new Date().toLocaleTimeString());
  }

  function syncError(msg) {
    setSyncStatus('同步失败');
    showToast(msg || '同步失败，请重试', 'error');
  }

  /**
   * 通用：执行操作 → 提交到 GitHub → 刷新表格
   */
  function commitAndRefresh(message, refreshFn) {
    syncStart();
    CCNData.commitData(message)
      .then(function () {
        syncDone();
        showToast('已保存并同步至 GitHub');
        if (refreshFn) refreshFn();
      })
      .catch(function (err) {
        syncError(err.message);
        // 同步失败，重新拉取数据以恢复一致状态
        CCNData.fetchData().then(function () {
          if (refreshFn) refreshFn();
        });
      });
  }

  /* ===== 新闻管理 ===== */
  function renderNewsTable() {
    var news = CCNData.getNews();
    var tbody = document.getElementById('news-tbody');

    if (news.length === 0) {
      tbody.innerHTML = '<tr><td colspan="5"><div class="empty-state">' +
        '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/></svg>' +
        '<p>暂无新闻，点击"添加新闻"创建</p></div></td></tr>';
      return;
    }

    tbody.innerHTML = news.map(function (item) {
      return '<tr>' +
        '<td class="col-date">' + escapeHtml(item.date) + '</td>' +
        '<td><span class="badge badge-blue">' + escapeHtml(item.tag || item.category) + '</span></td>' +
        '<td class="col-title">' + escapeHtml(item.title) + '</td>' +
        '<td class="col-summary">' + escapeHtml(item.summary) + '</td>' +
        '<td class="col-actions">' +
          '<button class="btn-admin btn-admin-outline btn-admin-sm" onclick="AdminApp.openNewsModal(\'' + item.id + '\')">编辑</button>' +
          '<button class="btn-admin btn-admin-danger btn-admin-sm" onclick="AdminApp.confirmDelete(\'news\',\'' + item.id + '\',\'' + escapeAttr(item.title) + '\')">删除</button>' +
        '</td>' +
      '</tr>';
    }).join('');
  }

  function openNewsModal(id) {
    editMode = 'news';
    editId = id || null;
    var item = id ? CCNData.getNews().find(function (n) { return n.id === id; }) : null;

    document.getElementById('modal-title').textContent = id ? '编辑新闻' : '添加新闻';
    document.getElementById('modal-body').innerHTML =
      '<div class="form-group">' +
        '<label>日期 <span class="required">*</span></label>' +
        '<input type="date" id="f-date" value="' + (item ? item.date : new Date().toISOString().slice(0, 10)) + '">' +
      '</div>' +
      '<div class="form-row">' +
        '<div class="form-group">' +
          '<label>分类 <span class="required">*</span></label>' +
          '<select id="f-category">' +
            '<option value="research"' + (item && item.category === 'research' ? ' selected' : '') + '>科研成果</option>' +
            '<option value="activity"' + (item && item.category === 'activity' ? ' selected' : '') + '>团队活动</option>' +
            '<option value="project"' + (item && item.category === 'project' ? ' selected' : '') + '>项目进展</option>' +
            '<option value="award"' + (item && item.category === 'award' ? ' selected' : '') + '>荣誉获奖</option>' +
          '</select>' +
        '</div>' +
        '<div class="form-group">' +
          '<label>标签文字 <span class="required">*</span></label>' +
          '<input type="text" id="f-tag" value="' + (item ? escapeAttr(item.tag) : '') + '" placeholder="如：科研成果">' +
        '</div>' +
      '</div>' +
      '<div class="form-group">' +
        '<label>标题 <span class="required">*</span></label>' +
        '<input type="text" id="f-title" value="' + (item ? escapeAttr(item.title) : '') + '" placeholder="请输入新闻标题">' +
      '</div>' +
      '<div class="form-group">' +
        '<label>摘要 <span class="required">*</span></label>' +
        '<textarea id="f-summary" placeholder="请输入新闻摘要">' + (item ? escapeHtml(item.summary) : '') + '</textarea>' +
      '</div>';

    document.getElementById('modal-save-btn').onclick = saveNews;
    document.getElementById('modal-form').classList.add('show');
  }

  function saveNews() {
    var date = document.getElementById('f-date').value.trim();
    var category = document.getElementById('f-category').value;
    var tag = document.getElementById('f-tag').value.trim();
    var title = document.getElementById('f-title').value.trim();
    var summary = document.getElementById('f-summary').value.trim();

    if (!title || !summary || !date) {
      showToast('请填写所有必填字段', 'error');
      return;
    }

    var tagMap = { research: '科研成果', activity: '团队活动', project: '项目进展', award: '荣誉获奖' };
    var data = { date: date, category: category, tag: tag || tagMap[category], title: title, summary: summary };

    var msg;
    if (editId) {
      CCNData.updateNews(editId, data);
      msg = '编辑新闻: ' + title;
    } else {
      CCNData.addNews(data);
      msg = '添加新闻: ' + title;
    }
    closeModal();
    commitAndRefresh(msg, renderNewsTable);
  }

  /* ===== 项目管理 ===== */
  function renderProjectsTable() {
    var projects = CCNData.getProjects();
    var tbody = document.getElementById('projects-tbody');

    if (projects.length === 0) {
      tbody.innerHTML = '<tr><td colspan="6"><div class="empty-state">' +
        '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"/></svg>' +
        '<p>暂无项目，点击"添加项目"创建</p></div></td></tr>';
      return;
    }

    var categoryMap = { cloud: '云计算平台', network: '算力网络', edge: '边缘计算', fusion: '云网融合' };

    tbody.innerHTML = projects.map(function (item) {
      var statusBadge = item.status === '运行中' ? 'badge-green' : (item.status === '研发中' ? 'badge-orange' : 'badge-gray');
      return '<tr>' +
        '<td><span class="badge ' + statusBadge + '">' + escapeHtml(item.status) + '</span></td>' +
        '<td><span class="badge badge-blue">' + escapeHtml(categoryMap[item.category] || item.category) + '</span></td>' +
        '<td class="col-title">' + escapeHtml(item.title) + '</td>' +
        '<td>' + (item.tags || []).map(function (t) { return '<span class="badge badge-gray" style="margin-right:4px;">' + escapeHtml(t) + '</span>'; }).join('') + '</td>' +
        '<td class="col-summary">' + escapeHtml(item.summary) + '</td>' +
        '<td class="col-actions">' +
          '<button class="btn-admin btn-admin-outline btn-admin-sm" onclick="AdminApp.openProjectModal(\'' + item.id + '\')">编辑</button>' +
          '<button class="btn-admin btn-admin-danger btn-admin-sm" onclick="AdminApp.confirmDelete(\'projects\',\'' + item.id + '\',\'' + escapeAttr(item.title) + '\')">删除</button>' +
        '</td>' +
      '</tr>';
    }).join('');
  }

  function openProjectModal(id) {
    editMode = 'projects';
    editId = id || null;
    var item = id ? CCNData.getProjects().find(function (p) { return p.id === id; }) : null;

    document.getElementById('modal-title').textContent = id ? '编辑项目' : '添加项目';
    document.getElementById('modal-body').innerHTML =
      '<div class="form-row">' +
        '<div class="form-group">' +
          '<label>分类 <span class="required">*</span></label>' +
          '<select id="f-category">' +
            '<option value="cloud"' + (item && item.category === 'cloud' ? ' selected' : '') + '>云计算平台</option>' +
            '<option value="network"' + (item && item.category === 'network' ? ' selected' : '') + '>算力网络</option>' +
            '<option value="edge"' + (item && item.category === 'edge' ? ' selected' : '') + '>边缘计算</option>' +
            '<option value="fusion"' + (item && item.category === 'fusion' ? ' selected' : '') + '>云网融合</option>' +
          '</select>' +
        '</div>' +
        '<div class="form-group">' +
          '<label>状态 <span class="required">*</span></label>' +
          '<select id="f-status">' +
            '<option value="运行中"' + (item && item.status === '运行中' ? ' selected' : '') + '>运行中</option>' +
            '<option value="研发中"' + (item && item.status === '研发中' ? ' selected' : '') + '>研发中</option>' +
            '<option value="已验收"' + (item && item.status === '已验收' ? ' selected' : '') + '>已验收</option>' +
          '</select>' +
        '</div>' +
      '</div>' +
      '<div class="form-group">' +
        '<label>标题 <span class="required">*</span></label>' +
        '<input type="text" id="f-title" value="' + (item ? escapeAttr(item.title) : '') + '" placeholder="请输入项目名称">' +
      '</div>' +
      '<div class="form-group">' +
        '<label>标签 <span class="required">*</span></label>' +
        '<input type="text" id="f-tags" value="' + (item ? escapeAttr((item.tags || []).join('，')) : '') + '" placeholder="多个标签用逗号分隔">' +
        '<div class="form-hint">多个标签用逗号分隔，如：国家级项目，算力调度，深度学习</div>' +
      '</div>' +
      '<div class="form-group">' +
        '<label>摘要 <span class="required">*</span></label>' +
        '<textarea id="f-summary" placeholder="请输入项目简介">' + (item ? escapeHtml(item.summary) : '') + '</textarea>' +
      '</div>';

    document.getElementById('modal-save-btn').onclick = saveProject;
    document.getElementById('modal-form').classList.add('show');
  }

  function saveProject() {
    var category = document.getElementById('f-category').value;
    var status = document.getElementById('f-status').value;
    var title = document.getElementById('f-title').value.trim();
    var tags = document.getElementById('f-tags').value.trim();
    var summary = document.getElementById('f-summary').value.trim();

    if (!title || !summary || !tags) {
      showToast('请填写所有必填字段', 'error');
      return;
    }

    var data = { category: category, status: status, title: title, tags: tags, summary: summary };
    var msg;
    if (editId) {
      CCNData.updateProject(editId, data);
      msg = '编辑项目: ' + title;
    } else {
      CCNData.addProject(data);
      msg = '添加项目: ' + title;
    }
    closeModal();
    commitAndRefresh(msg, renderProjectsTable);
  }

  /* ===== 专家管理 ===== */
  function renderExpertsTable() {
    var experts = CCNData.getExperts();
    var tbody = document.getElementById('experts-tbody');

    if (experts.length === 0) {
      tbody.innerHTML = '<tr><td colspan="5"><div class="empty-state">' +
        '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/></svg>' +
        '<p>暂无专家，点击"添加专家"创建</p></div></td></tr>';
      return;
    }

    tbody.innerHTML = experts.map(function (item) {
      return '<tr>' +
        '<td class="col-title">' + escapeHtml(item.name) + '</td>' +
        '<td><span class="badge badge-blue">' + escapeHtml(item.title) + '</span></td>' +
        '<td class="col-summary">' + escapeHtml(item.desc) + '</td>' +
        '<td>' + (item.tags || []).map(function (t) { return '<span class="badge badge-gray" style="margin-right:4px;">' + escapeHtml(t) + '</span>'; }).join('') + '</td>' +
        '<td class="col-actions">' +
          '<button class="btn-admin btn-admin-outline btn-admin-sm" onclick="AdminApp.openExpertModal(\'' + item.id + '\')">编辑</button>' +
          '<button class="btn-admin btn-admin-danger btn-admin-sm" onclick="AdminApp.confirmDelete(\'experts\',\'' + item.id + '\',\'' + escapeAttr(item.name) + '\')">删除</button>' +
        '</td>' +
      '</tr>';
    }).join('');
  }

  function openExpertModal(id) {
    editMode = 'experts';
    editId = id || null;
    var item = id ? CCNData.getExperts().find(function (e) { return e.id === id; }) : null;

    document.getElementById('modal-title').textContent = id ? '编辑专家' : '添加专家';
    document.getElementById('modal-body').innerHTML =
      '<div class="form-row">' +
        '<div class="form-group">' +
          '<label>姓名 <span class="required">*</span></label>' +
          '<input type="text" id="f-name" value="' + (item ? escapeAttr(item.name) : '') + '" placeholder="请输入专家姓名">' +
        '</div>' +
        '<div class="form-group">' +
          '<label>职称 <span class="required">*</span></label>' +
          '<input type="text" id="f-title" value="' + (item ? escapeAttr(item.title) : '') + '" placeholder="如：研究员 / 副研究员">' +
        '</div>' +
      '</div>' +
      '<div class="form-group">' +
        '<label>简介 <span class="required">*</span></label>' +
        '<textarea id="f-desc" placeholder="请输入专家简介">' + (item ? escapeHtml(item.desc) : '') + '</textarea>' +
      '</div>' +
      '<div class="form-group">' +
        '<label>研究方向 <span class="required">*</span></label>' +
        '<input type="text" id="f-tags" value="' + (item ? escapeAttr((item.tags || []).join('，')) : '') + '" placeholder="多个方向用逗号分隔">' +
        '<div class="form-hint">多个方向用逗号分隔，如：算力网络架构，资源调度，分布式系统</div>' +
      '</div>';

    document.getElementById('modal-save-btn').onclick = saveExpert;
    document.getElementById('modal-form').classList.add('show');
  }

  function saveExpert() {
    var name = document.getElementById('f-name').value.trim();
    var title = document.getElementById('f-title').value.trim();
    var desc = document.getElementById('f-desc').value.trim();
    var tags = document.getElementById('f-tags').value.trim();

    if (!name || !title || !desc || !tags) {
      showToast('请填写所有必填字段', 'error');
      return;
    }

    var data = { name: name, title: title, desc: desc, tags: tags };
    var msg;
    if (editId) {
      CCNData.updateExpert(editId, data);
      msg = '编辑专家: ' + name;
    } else {
      CCNData.addExpert(data);
      msg = '添加专家: ' + name;
    }
    closeModal();
    commitAndRefresh(msg, renderExpertsTable);
  }

  /* ===== 删除确认 ===== */
  function confirmDelete(type, id, name) {
    document.getElementById('confirm-sub').textContent = '将永久删除「' + name + '」';
    confirmCallback = function () {
      closeConfirm();
      var msg;
      if (type === 'news') {
        CCNData.deleteNews(id);
        msg = '删除新闻: ' + name;
      }
      if (type === 'projects') {
        CCNData.deleteProject(id);
        msg = '删除项目: ' + name;
      }
      if (type === 'experts') {
        CCNData.deleteExpert(id);
        msg = '删除专家: ' + name;
      }

      var refreshFn = null;
      if (type === 'news') refreshFn = renderNewsTable;
      if (type === 'projects') refreshFn = renderProjectsTable;
      if (type === 'experts') refreshFn = renderExpertsTable;

      commitAndRefresh(msg, refreshFn);
    };
    document.getElementById('confirm-delete-btn').onclick = confirmCallback;
    document.getElementById('modal-confirm').classList.add('show');
  }

  function closeConfirm() {
    document.getElementById('modal-confirm').classList.remove('show');
    confirmCallback = null;
  }

  /* ===== 模态框 ===== */
  function closeModal() {
    document.getElementById('modal-form').classList.remove('show');
    editMode = null;
    editId = null;
  }

  /* ===== 导出备份 ===== */
  function handleExport() {
    var data = CCNData.exportData();
    var blob = new Blob([data], { type: 'application/json' });
    var url = URL.createObjectURL(blob);
    var a = document.createElement('a');
    a.href = url;
    a.download = 'ccn-data-' + new Date().toISOString().slice(0, 10) + '.json';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    showToast('数据已导出');
  }

  /* ===== Toast ===== */
  var toastTimer = null;
  function showToast(msg, type) {
    var toast = document.getElementById('toast');
    toast.textContent = msg;
    toast.style.background = type === 'error' ? '#EF4444' : '#1E293B';
    toast.style.transform = 'translateX(-50%) translateY(0)';
    if (toastTimer) clearTimeout(toastTimer);
    toastTimer = setTimeout(function () {
      toast.style.transform = 'translateX(-50%) translateY(100px)';
    }, 2500);
  }

  /* ===== 工具函数 ===== */
  function escapeHtml(str) {
    if (!str) return '';
    return String(str).replace(/[&<>"']/g, function (s) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[s];
    });
  }

  function escapeAttr(str) {
    if (!str) return '';
    return String(str).replace(/'/g, "\\'").replace(/"/g, '&quot;');
  }

  /* ===== 初始化 ===== */
  function init() {
    // 如果已有配置（sessionStorage），自动尝试连接
    if (CCNData.isConfigured()) {
      setSyncStatus('正在连接 GitHub...');
      CCNData.fetchData()
        .then(function () {
          showAdmin();
        })
        .catch(function () {
          CCNData.clearConfig();
          setSyncStatus('');
        });
    }

    // 回车登录
    document.getElementById('gh-branch').addEventListener('keypress', function (e) {
      if (e.key === 'Enter') handleLogin();
    });

    // 点击遮罩关闭模态框
    document.getElementById('modal-form').addEventListener('click', function (e) {
      if (e.target === this) closeModal();
    });
    document.getElementById('modal-confirm').addEventListener('click', function (e) {
      if (e.target === this) closeConfirm();
    });
  }

  return {
    init: init,
    handleLogin: handleLogin,
    handleLogout: handleLogout,
    switchTab: switchTab,
    openNewsModal: openNewsModal,
    openProjectModal: openProjectModal,
    openExpertModal: openExpertModal,
    confirmDelete: confirmDelete,
    closeConfirm: closeConfirm,
    closeModal: closeModal,
    handleExport: handleExport
  };
})();

document.addEventListener('DOMContentLoaded', AdminApp.init);
