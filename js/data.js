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
      id: 'n001',
      category: 'research',
      tag: '科研成果',
      date: '2026-08-10',
      title: '团队在算力网络智能调度领域取得突破性进展',
      summary: '提出基于深度强化学习的多目标算力调度算法，在真实测试环境中实现资源利用率提升35%，相关成果被国际顶级期刊收录。'
    },
    {
      id: 'n002',
      category: 'activity',
      tag: '团队活动',
      date: '2026-07-28',
      title: '团队成功举办2026算力网络前沿技术研讨会',
      summary: '邀请国内外知名专家学者共聚一堂，围绕算力网络架构演进、算网融合关键技术等议题展开深入研讨。'
    },
    {
      id: 'n003',
      category: 'project',
      tag: '项目进展',
      date: '2026-07-15',
      title: '"东数西算"算力调度平台二期项目顺利验收',
      summary: '平台已覆盖全国8大算力枢纽节点，实现跨地域算力资源智能调度与统一服务，日均处理调度请求超千万次。'
    },
    {
      id: 'n004',
      category: 'award',
      tag: '荣誉获奖',
      date: '2026-06-30',
      title: '团队荣获2026年度云计算技术创新特等奖',
      summary: '凭借"面向算力网络的智能调度关键技术及应用"成果，团队荣获中国云计算技术创新特等奖。'
    },
    {
      id: 'n005',
      category: 'research',
      tag: '科研成果',
      date: '2026-06-18',
      title: '云网融合架构白皮书正式发布',
      summary: '团队联合产业界合作伙伴共同发布《面向算力网络的云网融合架构白皮书》，系统阐述云网融合技术路线。'
    },
    {
      id: 'n006',
      category: 'project',
      tag: '项目进展',
      date: '2026-05-22',
      title: '边缘算力协同平台完成三期部署',
      summary: '平台已在全国部署超过200个边缘节点，支持毫秒级算力响应，服务覆盖智能制造、智慧城市等多个领域。'
    },
    {
      id: 'n007',
      category: 'activity',
      tag: '团队活动',
      date: '2026-05-10',
      title: '团队赴多家头部企业开展技术交流',
      summary: '团队核心成员先后走访华为、阿里云、腾讯云等企业，就算力网络技术合作与产业落地进行深入交流。'
    },
    {
      id: 'n008',
      category: 'award',
      tag: '荣誉获奖',
      date: '2026-04-15',
      title: '3位团队成员入选青年人才计划',
      summary: '团队3位青年学者成功入选国家级青年人才计划，展现了团队在人才培养方面的突出成效。'
    },
    {
      id: 'n009',
      category: 'research',
      tag: '科研成果',
      date: '2026-03-20',
      title: '多篇论文被国际顶级会议录用',
      summary: '团队有5篇论文被INFOCOM、ICDCS等国际顶级会议录用，研究涵盖算力感知、任务编排等前沿方向。'
    }
  ];

  var SEED_PROJECTS = [
    {
      id: 'p001',
      category: 'network',
      status: '运行中',
      title: '东数西算智能调度平台',
      tags: ['国家级项目', '算力调度', '深度学习'],
      summary: '面向国家"东数西算"工程，构建覆盖全国8大算力枢纽节点的智能调度平台，实现跨地域算力资源统一编排与按需分配。'
    },
    {
      id: 'p002',
      category: 'cloud',
      status: '运行中',
      title: '云原生计算平台',
      tags: ['自研平台', '容器编排', '弹性伸缩'],
      summary: '自主研发百万级容器编排平台，支持自动弹性伸缩、灰度发布与多租户隔离，为上层应用提供高可用算力服务底座。'
    },
    {
      id: 'p003',
      category: 'edge',
      status: '运行中',
      title: '边缘算力协同平台',
      tags: ['三期部署', '边缘计算', '低延迟'],
      summary: '在全国部署超过200个边缘节点，支持毫秒级算力响应，服务覆盖智能制造、智慧城市、自动驾驶等多个领域。'
    },
    {
      id: 'p004',
      category: 'fusion',
      status: '运行中',
      title: '云网融合架构系统',
      tags: ['重点研发', '云网协同', 'SDN'],
      summary: '构建云网一体化架构体系，实现计算资源与网络资源的协同调度，端到端服务开通时间缩短80%。'
    },
    {
      id: 'p005',
      category: 'network',
      status: '运行中',
      title: '算力感知与度量系统',
      tags: ['基础研究', '算力度量', '感知网络'],
      summary: '建立统一的算力度量模型与感知体系，实现全网算力资源的实时感知与量化评估，为智能调度提供数据支撑。'
    },
    {
      id: 'p006',
      category: 'cloud',
      status: '运行中',
      title: '云安全可信计算平台',
      tags: ['安全可信', '隐私计算', '区块链'],
      summary: '融合可信计算与隐私保护技术，构建端到端安全防护体系，保障算力数据全链路安全与隐私合规。'
    },
    {
      id: 'p007',
      category: 'edge',
      status: '研发中',
      title: 'AI驱动的智能运维系统',
      tags: ['AIOps', '故障预测', '自动修复'],
      summary: '基于大模型的智能运维平台，实现故障预测、根因分析与自动修复，运维效率提升10倍，MTTR降低60%。'
    },
    {
      id: 'p008',
      category: 'fusion',
      status: '研发中',
      title: '算力网络2.0架构研究',
      tags: ['前沿探索', '架构设计', '算网一体'],
      summary: '面向未来算力网络演进，探索算网一体原生架构，研究算力原生网络协议与内生安全机制。'
    },
    {
      id: 'p009',
      category: 'network',
      status: '已验收',
      title: '多域算力资源编排系统',
      tags: ['国家自然科学基金', '资源编排', '多域协同'],
      summary: '突破多域异构算力资源统一建模与编排难题，实现跨域算力任务智能分解与高效调度。'
    }
  ];

  var SEED_EXPERTS = [
    {
      id: 'e001',
      name: '张明远',
      initial: '张',
      title: '团队负责人 / 首席科学家',
      desc: '国家级高层次人才，长期从事云计算与算力网络研究，主持国家级项目10余项，发表学术论文100余篇。',
      tags: ['算力网络架构', '资源调度', '分布式系统']
    },
    {
      id: 'e002',
      name: '李云帆',
      initial: '李',
      title: '首席架构师 / 研究员',
      desc: '专注于云原生计算平台与容器编排技术，主导设计团队自研云平台架构，支撑百万级容器运行。',
      tags: ['云原生', '容器编排', '微服务']
    },
    {
      id: 'e003',
      name: '王晓峰',
      initial: '王',
      title: '研究方向负责人 / 研究员',
      desc: '深耕算力网络智能调度领域，提出多目标调度算法体系，相关成果在国际顶级会议发表论文20余篇。',
      tags: ['智能调度', '深度学习', '优化算法']
    },
    {
      id: 'e004',
      name: '陈思远',
      initial: '陈',
      title: '边缘计算方向负责人 / 副研究员',
      desc: '专注于边缘计算与算力协同技术，主导边缘算力平台研发，部署节点超200个，服务多个行业领域。',
      tags: ['边缘计算', '算力协同', '低延迟']
    },
    {
      id: 'e005',
      name: '刘建国',
      initial: '刘',
      title: '云网融合方向负责人 / 副研究员',
      desc: '从事云网融合架构与SDN技术研究，在云网协同资源调度方面取得系列创新成果，授权发明专利15项。',
      tags: ['云网融合', 'SDN', '网络架构']
    },
    {
      id: 'e006',
      name: '赵雅琴',
      initial: '赵',
      title: '安全研究方向负责人 / 副研究员',
      desc: '聚焦云计算安全与隐私保护，融合可信计算与区块链技术，构建端到端安全防护体系。',
      tags: ['云安全', '隐私计算', '可信计算']
    },
    {
      id: 'e007',
      name: '孙浩然',
      initial: '孙',
      title: '智能运维方向负责人 / 副研究员',
      desc: '致力于AIOps技术研究，开发基于大模型的智能运维平台，实现故障预测与自动修复，运维效率提升10倍。',
      tags: ['AIOps', '大模型', '故障诊断']
    },
    {
      id: 'e008',
      name: '周敏华',
      initial: '周',
      title: '青年学者 / 助理研究员',
      desc: '入选国家级青年人才计划，研究方向为算力感知与度量，建立统一算力度量模型与评估体系。',
      tags: ['算力感知', '度量模型', '性能评估']
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
