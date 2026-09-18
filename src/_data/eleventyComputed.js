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
    }
};
