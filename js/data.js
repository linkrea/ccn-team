/**
 * 云计算及算力网络 - 数据管理层
 * 基于 localStorage 实现内容的增删改查
 * 支持数据导出/导入备份
 */

var CCNData = (function () {

  var STORAGE_KEYS = {
    news: 'ccn_news',
    projects: 'ccn_projects',
    experts: 'ccn_experts',
    auth: 'ccn_admin_auth'
  };

  /* ===== 种子数据 ===== */
  var SEED_NEWS = [
    {
      "id": "n001",
      "category": "research",
      "tag": "期刊论文",
      "date": "2026-08-10",
      "title": "发表核心期刊论文：基于闲时算力调度的算电协同方法与实践",
      "summary": "算电协同：闲时算力如何成为新型电力系统的柔性资源？团队联合清华大学发表核心期刊论文。\n付智,郑博文,刘效辰,程伟等.基于闲时算力调度的算电协同方法与实践[J/OL].电力系统自动化,2026-07-09."
    },
    {
      "id": "n004",
      "category": "award",
      "tag": "荣誉获奖",
      "date": "2026-07-30",
      "title": "团队荣获2025年度广东省科技进步奖二等奖",
      "summary": "凭借\"超大规模云数据中心跨层资源管理关键技术及应用\"成果，团队荣获2025年度广东省科技进步奖二等奖"
    }
  ];

  var SEED_PROJECTS = [
    {
      "id": "p001",
      "category": "network",
      "status": "研发中",
      "title": "基于星罗的粤港澳大湾区异构算力任务编排协同系统研究及应用",
      "tags": [
        "集团核心攻关项目",
        "算力调度"
      ],
      "summary": "构建基于\"星罗\"算力平台的跨域任务编排系统，实现异构算力资源的统一纳管与智能调度。"
    },
       {
      "id": "p002",
      "category": "network",
      "status": "研发中",
      "title": "异构算力跨域任务编排系统",
      "tags": [
        "工信部算力强基揭榜挂帅项目"
      ],
      "summary": "聚焦国产算力适配、跨域调度与绿色网络三大方向。"
    }

  ];

  var SEED_EXPERTS = [
    {
      "id": "e001",
      "name": "程伟",
      "initial": "程",
      "title": "领域带头人",
      "desc": "博士，正高级工程师。中国联通广东省分公司智算运营中心总经理，中国联通云计算首席专家。IEEE PES电力系统通信与网络安全技术委员会（中国）电碳算协同技术分委会副主席、数字广东建设专家委员会专家。",
      "tags": [
        "云计算",
        "智算",
        "数据中心"
      ]
    },
    {
      "id": "e002",
      "name": "刘惜吾",
      "initial": "刘",
      "title": "算力网络专业带头人",
      "desc": "负责算力网络关键技术研发，涵盖新型算力基础设施、超节点技术、广域异构算网一体化调度、跨境算网一体化、跨境数据合规传输、算电协同、绿色算电等技术领域",
      "tags": [
        "算力网络",
        "Token运营"
      ]
    },
    {
      "id": "e003",
      "name": "曾楚轩",
      "initial": "曾",
      "title": "算力平台专业带头人",
      "desc": "负责算力网络平台及产品化研发，涵盖算力标识、算力监测、算力交易及服务平台研发，打造电商化算网一体化平台，提供开箱即用的算网服务产品",
      "tags": [
        "智能调度",
        "算力平台"
      ]
    }
  ];

  /* ===== 工具函数 ===== */
  function read(key, seed) {
    var raw = localStorage.getItem(key);
    if (raw) {
      try {
        return JSON.parse(raw);
      } catch (e) {
        // 数据损坏，重新初始化
      }
    }
    localStorage.setItem(key, JSON.stringify(seed));
    return seed.slice();
  }

  function write(key, data) {
    localStorage.setItem(key, JSON.stringify(data));
  }

  function genId(prefix) {
    return prefix + Date.now().toString(36) + Math.random().toString(36).slice(2, 6);
  }

  /* ===== 公共 API ===== */

  // 初始化（如果 localStorage 为空则写入种子数据）
  function init() {
    read(STORAGE_KEYS.news, SEED_NEWS);
    read(STORAGE_KEYS.projects, SEED_PROJECTS);
    read(STORAGE_KEYS.experts, SEED_EXPERTS);
  }

  // 重置为默认数据
  function resetAll() {
    write(STORAGE_KEYS.news, SEED_NEWS);
    write(STORAGE_KEYS.projects, SEED_PROJECTS);
    write(STORAGE_KEYS.experts, SEED_EXPERTS);
  }

  /* --- 新闻 --- */
  function getNews() {
    return read(STORAGE_KEYS.news, SEED_NEWS);
  }

  function addNews(item) {
    var list = getNews();
    item.id = genId('n');
    item.date = item.date || new Date().toISOString().slice(0, 10);
    list.unshift(item);
    write(STORAGE_KEYS.news, list);
    return item;
  }

  function updateNews(id, updates) {
    var list = getNews();
    var idx = list.findIndex(function (n) { return n.id === id; });
    if (idx >= 0) {
      list[idx] = Object.assign(list[idx], updates);
      write(STORAGE_KEYS.news, list);
      return list[idx];
    }
    return null;
  }

  function deleteNews(id) {
    var list = getNews().filter(function (n) { return n.id !== id; });
    write(STORAGE_KEYS.news, list);
  }

  /* --- 项目 --- */
  function getProjects() {
    return read(STORAGE_KEYS.projects, SEED_PROJECTS);
  }

  function addProject(item) {
    var list = getProjects();
    item.id = genId('p');
    if (typeof item.tags === 'string') {
      item.tags = item.tags.split(/[,，]/).map(function (t) { return t.trim(); }).filter(Boolean);
    }
    list.unshift(item);
    write(STORAGE_KEYS.projects, list);
    return item;
  }

  function updateProject(id, updates) {
    var list = getProjects();
    var idx = list.findIndex(function (p) { return p.id === id; });
    if (idx >= 0) {
      if (updates.tags && typeof updates.tags === 'string') {
        updates.tags = updates.tags.split(/[,，]/).map(function (t) { return t.trim(); }).filter(Boolean);
      }
      list[idx] = Object.assign(list[idx], updates);
      write(STORAGE_KEYS.projects, list);
      return list[idx];
    }
    return null;
  }

  function deleteProject(id) {
    var list = getProjects().filter(function (p) { return p.id !== id; });
    write(STORAGE_KEYS.projects, list);
  }

  /* --- 专家 --- */
  function getExperts() {
    return read(STORAGE_KEYS.experts, SEED_EXPERTS);
  }

  function addExpert(item) {
    var list = getExperts();
    item.id = genId('e');
    item.initial = item.name ? item.name.charAt(0) : '?';
    if (typeof item.tags === 'string') {
      item.tags = item.tags.split(/[,，]/).map(function (t) { return t.trim(); }).filter(Boolean);
    }
    list.push(item);
    write(STORAGE_KEYS.experts, list);
    return item;
  }

  function updateExpert(id, updates) {
    var list = getExperts();
    var idx = list.findIndex(function (e) { return e.id === id; });
    if (idx >= 0) {
      if (updates.name) {
        updates.initial = updates.name.charAt(0);
      }
      if (updates.tags && typeof updates.tags === 'string') {
        updates.tags = updates.tags.split(/[,，]/).map(function (t) { return t.trim(); }).filter(Boolean);
      }
      list[idx] = Object.assign(list[idx], updates);
      write(STORAGE_KEYS.experts, list);
      return list[idx];
    }
    return null;
  }

  function deleteExpert(id) {
    var list = getExperts().filter(function (e) { return e.id !== id; });
    write(STORAGE_KEYS.experts, list);
  }

  /* --- 认证（简单客户端密码） --- */
  var ADMIN_PASSWORD = 'admin123';

  function login(password) {
    if (password === ADMIN_PASSWORD) {
      sessionStorage.setItem(STORAGE_KEYS.auth, '1');
      return true;
    }
    return false;
  }

  function logout() {
    sessionStorage.removeItem(STORAGE_KEYS.auth);
  }

  function isLoggedIn() {
    return sessionStorage.getItem(STORAGE_KEYS.auth) === '1';
  }

  /* --- 导出/导入 --- */
  function exportData() {
    return JSON.stringify({
      news: getNews(),
      projects: getProjects(),
      experts: getExperts(),
      exportedAt: new Date().toISOString()
    }, null, 2);
  }

  function importData(jsonStr) {
    var data = JSON.parse(jsonStr);
    if (data.news) write(STORAGE_KEYS.news, data.news);
    if (data.projects) write(STORAGE_KEYS.projects, data.projects);
    if (data.experts) write(STORAGE_KEYS.experts, data.experts);
  }

  return {
    init: init,
    resetAll: resetAll,
    STORAGE_KEYS: STORAGE_KEYS,

    // 新闻
    getNews: getNews,
    addNews: addNews,
    updateNews: updateNews,
    deleteNews: deleteNews,

    // 项目
    getProjects: getProjects,
    addProject: addProject,
    updateProject: updateProject,
    deleteProject: deleteProject,

    // 专家
    getExperts: getExperts,
    addExpert: addExpert,
    updateExpert: updateExpert,
    deleteExpert: deleteExpert,

    // 认证
    login: login,
    logout: logout,
    isLoggedIn: isLoggedIn,

    // 导入导出
    exportData: exportData,
    importData: importData
  };
})();
