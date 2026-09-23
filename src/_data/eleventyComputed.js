function stripTags(value) {
    return String(value || '')
        .replace(/<[^>]*>/g, '')
        .replace(/&lt;/g, '<')
        .replace(/&gt;/g, '>')
        .replace(/&quot;/g, '"')
        .replace(/&#39;/g, "'")
        .replace(/&amp;/g, '&')
        .replace(/\s+/g, ' ')
        .trim();
}

const SDK2_CRUMB = { label: 'Справочник pioneer_sdk2', url: '/sdk2/' };

export default {
    pageUrl: function (data) {
        if (data.pageNumber) {
            return '/' + String(data.pageNumber).padStart(2, '0') + '-' + data.pageSlug + '/';
        }
        const url = data.page && data.page.url;
        if (url && url !== '/') return url;
        return null;
    },
    prevPage: function (data) {
        if (!data.pageNumber || data.pageNumber <= 1) return null;
        const pages = data.lessonsData?.lessons || [];
        const prev = pages.find((l) => l.number === data.pageNumber - 1);
        if (!prev) return null;
        return { url: '/' + String(prev.number).padStart(2, '0') + '-' + prev.slug + '/', title: prev.title, number: prev.number };
    },
    nextPage: function (data) {
        if (!data.pageNumber) return null;
        const pages = data.lessonsData?.lessons || [];
        const next = pages.find((l) => l.number === data.pageNumber + 1);
        if (!next) return null;
        return { url: '/' + String(next.number).padStart(2, '0') + '-' + next.slug + '/', title: next.title, number: next.number };
    },
    currentSection: function (data) {
        if (!data.pageNumber) return null;
        const pages = data.lessonsData?.lessons || [];
        const sections = data.lessonsData?.sections || [];
        const page = pages.find((l) => l.number === data.pageNumber);
        if (!page) return null;
        return sections.find((s) => s.id === page.section) || null;
    },

    // --- Справочник SDK2 (страницы с alias m/cat/g/e) ---
    title: function (data) {
        if (data.m) return data.m.display;
        if (data.cat) return data.cat.title;
        if (data.g) return data.g.title + ' — примеры';
        if (data.e) return data.e.title;
        return data.title;
    },
    description: function (data) {
        if (data.m) return stripTags(data.m.summary);
        if (data.cat) return stripTags(data.cat.description);
        if (data.g) return stripTags(data.g.description);
        if (data.e) return stripTags(data.e.summary);
        return data.description;
    },
    crumbs: function (data) {
        if (data.m) {
            return [
                SDK2_CRUMB,
                { label: data.m.cat_title, url: '/sdk2/' + data.m.category + '/' },
                { label: data.m.display },
            ];
        }
        if (data.cat) {
            return [SDK2_CRUMB, { label: data.cat.title }];
        }
        if (data.g) {
            return [SDK2_CRUMB, { label: 'Примеры', url: '/sdk2/examples/' }, { label: data.g.title }];
        }
        if (data.e) {
            return [
                SDK2_CRUMB,
                { label: 'Примеры', url: '/sdk2/examples/' },
                { label: data.e.group_title, url: '/sdk2/examples/' + data.e.group + '/' },
                { label: data.e.file },
            ];
        }
        return null;
    },
};
