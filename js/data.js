/**
 * 云计算及算力网络 - GitHub API 数据管理层
 * 通过 GitHub Contents API 读写 data/content.json
 * 每次保存创建一个 Git commit，GitHub Pages 自动部署更新
 */

var CCNData = (function () {

  var SESSION_KEY = 'ccn_github_config';
  var FILE_PATH = 'data/content.json';

  var config = null;
  var cache = null; // { data: {...}, sha: '...' }

  /* ===== GitHub 配置管理 ===== */

  function setConfig(token, owner, repo, branch) {
    config = {
      token: token,
      owner: owner,
      repo: repo,
      branch: branch || 'main'
    };
    sessionStorage.setItem(SESSION_KEY, JSON.stringify(config));
  }

  function loadConfig() {
    var raw = sessionStorage.getItem(SESSION_KEY);
    if (raw) {
      try {
        config = JSON.parse(raw);
        return true;
      } catch (e) {
        config = null;
      }
    }
    return false;
  }

  function isConfigured() {
    if (!config) loadConfig();
    return !!(config && config.token && config.owner && config.repo);
  }

  function clearConfig() {
    config = null;
    cache = null;
    sessionStorage.removeItem(SESSION_KEY);
  }

  function getConfig() {
    if (!config) loadConfig();
    return config;
  }

  /* ===== GitHub API ===== */

  function apiUrl() {
    var c = getConfig();
    return 'https://api.github.com/repos/' + c.owner + '/' + c.repo + '/contents/' + FILE_PATH + '?ref=' + c.branch;
  }

  function apiHeaders() {
    var c = getConfig();
    return {
      'Authorization': 'Bearer ' + c.token,
      'Accept': 'application/vnd.github+json',
      'X-GitHub-Api-Version': '2022-11-28'
    };
  }

  /**
   * 从 GitHub 拉取 content.json
   * 返回 Promise<data>
   */
  function fetchData() {
    return fetch(apiUrl(), { headers: apiHeaders() })
      .then(function (res) {
        if (res.status === 404) {
          throw new Error('文件 data/content.json 不存在，请先在仓库中创建该文件');
        }
        if (res.status === 401) {
          throw new Error('Token 无效或已过期，请重新输入');
        }
        if (res.status === 403) {
          throw new Error('权限不足，请确保 Token 有 repo 权限');
        }
        if (!res.ok) {
          throw new Error('GitHub API 错误: ' + res.status);
        }
        return res.json();
      })
      .then(function (fileInfo) {
        var content = decodeURIComponent(escape(atob(fileInfo.content.replace(/\n/g, ''))));
        var data = JSON.parse(content);
        cache = { data: data, sha: fileInfo.sha };
        return data;
      });
  }

  /**
   * 将当前内存中的数据保存到 GitHub
   * 返回 Promise<data>
   */
  function commitData(message) {
    if (!cache) {
      return Promise.reject(new Error('数据未加载，请先调用 fetchData()'));
    }

    var content = btoa(unescape(encodeURIComponent(JSON.stringify(cache.data, null, 2))));
    var body = {
      message: message || '更新网站内容',
      content: content,
      branch: config.branch,
      sha: cache.sha
    };

    return fetch(apiUrl(), {
      method: 'PUT',
      headers: apiHeaders(),
      body: JSON.stringify(body)
    })
      .then(function (res) {
        if (res.status === 409) {
          throw new Error('文件已被其他人修改，请刷新后重试');
        }
        if (res.status === 401) {
          throw new Error('Token 无效或已过期');
        }
        if (res.status === 403) {
          throw new Error('权限不足或触发 GitHub 限流，请稍后重试');
        }
        if (!res.ok) {
          throw new Error('保存失败: HTTP ' + res.status);
        }
        return res.json();
      })
      .then(function (result) {
        cache.sha = result.content.sha;
        return cache.data;
      });
  }

  /* ===== 工具函数 ===== */

  function genId(prefix) {
    return prefix + Date.now().toString(36) + Math.random().toString(36).slice(2, 6);
  }

  function parseTags(str) {
    if (Array.isArray(str)) return str;
    if (typeof str === 'string') {
      return str.split(/[,，]/).map(function (t) { return t.trim(); }).filter(Boolean);
    }
    return [];
  }

  /* ===== 数据访问 ===== */

  function getData() {
    return cache ? cache.data : null;
  }

  function getNews() {
    return cache ? (cache.data.news || []) : [];
  }

  function getProjects() {
    return cache ? (cache.data.projects || []) : [];
  }

  function getExperts() {
    return cache ? (cache.data.experts || []) : [];
  }

  /* ===== 新闻 CRUD ===== */

  function addNews(item) {
    item.id = genId('n');
    item.date = item.date || new Date().toISOString().slice(0, 10);
    cache.data.news.unshift(item);
    return item;
  }

  function updateNews(id, updates) {
    var list = cache.data.news;
    var idx = list.findIndex(function (n) { return n.id === id; });
    if (idx >= 0) {
      list[idx] = Object.assign(list[idx], updates);
      return list[idx];
    }
    return null;
  }

  function deleteNews(id) {
    cache.data.news = cache.data.news.filter(function (n) { return n.id !== id; });
  }

  /* ===== 项目 CRUD ===== */

  function addProject(item) {
    item.id = genId('p');
    item.tags = parseTags(item.tags);
    cache.data.projects.unshift(item);
    return item;
  }

  function updateProject(id, updates) {
    var list = cache.data.projects;
    var idx = list.findIndex(function (p) { return p.id === id; });
    if (idx >= 0) {
      if (updates.tags) updates.tags = parseTags(updates.tags);
      list[idx] = Object.assign(list[idx], updates);
      return list[idx];
    }
    return null;
  }

  function deleteProject(id) {
    cache.data.projects = cache.data.projects.filter(function (p) { return p.id !== id; });
  }

  /* ===== 专家 CRUD ===== */

  function addExpert(item) {
    item.id = genId('e');
    item.initial = item.name ? item.name.charAt(0) : '?';
    item.tags = parseTags(item.tags);
    cache.data.experts.push(item);
    return item;
  }

  function updateExpert(id, updates) {
    var list = cache.data.experts;
    var idx = list.findIndex(function (e) { return e.id === id; });
    if (idx >= 0) {
      if (updates.name) updates.initial = updates.name.charAt(0);
      if (updates.tags) updates.tags = parseTags(updates.tags);
      list[idx] = Object.assign(list[idx], updates);
      return list[idx];
    }
    return null;
  }

  function deleteExpert(id) {
    cache.data.experts = cache.data.experts.filter(function (e) { return e.id !== id; });
  }

  /* ===== 导出（用于下载备份） ===== */

  function exportData() {
    if (!cache) return '{}';
    return JSON.stringify({
      news: cache.data.news,
      projects: cache.data.projects,
      experts: cache.data.experts,
      exportedAt: new Date().toISOString()
    }, null, 2);
  }

  return {
    setConfig: setConfig,
    loadConfig: loadConfig,
    isConfigured: isConfigured,
    clearConfig: clearConfig,
    getConfig: getConfig,

    fetchData: fetchData,
    commitData: commitData,

    getData: getData,
    getNews: getNews,
    getProjects: getProjects,
    getExperts: getExperts,

    addNews: addNews,
    updateNews: updateNews,
    deleteNews: deleteNews,

    addProject: addProject,
    updateProject: updateProject,
    deleteProject: deleteProject,

    addExpert: addExpert,
    updateExpert: updateExpert,
    deleteExpert: deleteExpert,

    exportData: exportData
  };
})();
