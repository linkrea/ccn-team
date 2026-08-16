/**
 * 云计算及算力网络 - 前台页面动态渲染
 * 从 ./data/content.json 异步加载数据并渲染卡片
 */

var CCNRender = (function () {

  var NEWS_ICON = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/></svg>';

  var PROJECT_ICONS = {
    network: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/></svg>',
    cloud: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><rect x="2" y="3" width="20" height="14" rx="2" ry="2"/><line x1="8" y1="21" x2="16" y2="21"/><line x1="12" y1="17" x2="12" y2="21"/></svg>',
    edge: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><rect x="2" y="2" width="20" height="8" rx="2" ry="2"/><rect x="2" y="14" width="20" height="8" rx="2" ry="2"/><line x1="6" y1="6" x2="6.01" y2="6"/><line x1="6" y1="18" x2="6.01" y2="18"/></svg>',
    fusion: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M17.5 19H9a7 7 0 1 1 6.71-9h1.79a4.5 4.5 0 1 1 0 9Z"/><path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4"/></svg>'
  };

  var _cache = null;

  function escapeHtml(str) {
    if (!str) return '';
    return String(str).replace(/[&<>"']/g, function (s) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[s];
    });
  }

  /* ===== 异步加载数据 ===== */
  function loadData() {
    if (_cache) return Promise.resolve(_cache);
    return fetch('./data/content.json?t=' + Date.now())
      .then(function (res) {
        if (!res.ok) throw new Error('HTTP ' + res.status);
        return res.json();
      })
      .then(function (data) {
        _cache = data;
        return data;
      });
  }

  /* ===== 渲染新闻列表 ===== */
  function renderNews(containerId, limit) {
    var container = document.getElementById(containerId);
    if (!container) return;

    loadData().then(function (data) {
      var news = data.news || [];
      if (limit) news = news.slice(0, limit);

      if (news.length === 0) {
        container.innerHTML = '<div class="empty-state" style="grid-column:1/-1;"><p>暂无新闻内容</p></div>';
        return;
      }

      container.innerHTML = news.map(function (item) {
        return '<div class="news-card fade-in" data-category="' + escapeHtml(item.category) + '">' +
          '<div class="news-image">' +
            '<span class="news-tag">' + escapeHtml(item.tag || item.category) + '</span>' +
            NEWS_ICON +
          '</div>' +
          '<div class="news-body">' +
            '<div class="news-date">' + escapeHtml(item.date) + '</div>' +
            '<h3>' + escapeHtml(item.title) + '</h3>' +
            '<p>' + escapeHtml(item.summary) + '</p>' +
            '<a href="javascript:void(0)" class="read-more">阅读更多 →</a>' +
          '</div>' +
        '</div>';
      }).join('');

      triggerFadeIn(container);
    }).catch(function (err) {
      container.innerHTML = '<div class="empty-state" style="grid-column:1/-1;"><p>数据加载失败，请刷新重试</p></div>';
      console.error('加载新闻数据失败:', err);
    });
  }

  /* ===== 渲染项目列表 ===== */
  function renderProjects(containerId) {
    var container = document.getElementById(containerId);
    if (!container) return;

    loadData().then(function (data) {
      var projects = data.projects || [];

      if (projects.length === 0) {
        container.innerHTML = '<div class="empty-state" style="grid-column:1/-1;"><p>暂无项目内容</p></div>';
        return;
      }

      container.innerHTML = projects.map(function (item) {
        var icon = PROJECT_ICONS[item.category] || PROJECT_ICONS.cloud;
        var tagsHtml = (item.tags || []).map(function (t) {
          return '<span class="project-tag">' + escapeHtml(t) + '</span>';
        }).join('');

        return '<div class="project-card fade-in" data-category="' + escapeHtml(item.category) + '">' +
          '<div class="project-header">' +
            '<span class="project-status">' + escapeHtml(item.status) + '</span>' +
            icon +
          '</div>' +
          '<div class="project-body">' +
            '<h3>' + escapeHtml(item.title) + '</h3>' +
            '<div class="project-tags">' + tagsHtml + '</div>' +
            '<p>' + escapeHtml(item.summary) + '</p>' +
          '</div>' +
        '</div>';
      }).join('');

      triggerFadeIn(container);
    }).catch(function (err) {
      container.innerHTML = '<div class="empty-state" style="grid-column:1/-1;"><p>数据加载失败，请刷新重试</p></div>';
      console.error('加载项目数据失败:', err);
    });
  }

  /* ===== 渲染专家列表 ===== */
  function renderExperts(containerId) {
    var container = document.getElementById(containerId);
    if (!container) return;

    loadData().then(function (data) {
      var experts = data.experts || [];

      if (experts.length === 0) {
        container.innerHTML = '<div class="empty-state" style="grid-column:1/-1;"><p>暂无专家信息</p></div>';
        return;
      }

      container.innerHTML = experts.map(function (item) {
        var tagsHtml = (item.tags || []).map(function (t) {
          return '<span class="expert-tag">' + escapeHtml(t) + '</span>';
        }).join('');

        return '<div class="expert-card fade-in">' +
          '<div class="expert-avatar">' + escapeHtml(item.initial || (item.name ? item.name.charAt(0) : '?')) + '</div>' +
          '<div class="expert-body">' +
            '<h3>' + escapeHtml(item.name) + '</h3>' +
            '<p class="expert-title">' + escapeHtml(item.title) + '</p>' +
            '<p class="expert-desc">' + escapeHtml(item.desc) + '</p>' +
            '<div class="expert-tags">' + tagsHtml + '</div>' +
          '</div>' +
        '</div>';
      }).join('');

      triggerFadeIn(container);
    }).catch(function (err) {
      container.innerHTML = '<div class="empty-state" style="grid-column:1/-1;"><p>数据加载失败，请刷新重试</p></div>';
      console.error('加载专家数据失败:', err);
    });
  }

  /* ===== 触发渐入动画 ===== */
  function triggerFadeIn(container) {
    var elements = container.querySelectorAll('.fade-in');
    var observer = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.1, rootMargin: '0px 0px -50px 0px' });

    elements.forEach(function (el) {
      observer.observe(el);
    });
  }

  return {
    renderNews: renderNews,
    renderProjects: renderProjects,
    renderExperts: renderExperts
  };
})();
