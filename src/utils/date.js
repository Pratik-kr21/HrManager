export const format = (date, formatStr) => {
    if (!date) return '';
    const d = new Date(date);
    if (isNaN(d.getTime())) return '';

    const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    const shortDays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const months = [
        'January', 'February', 'March', 'April', 'May', 'June',
        'July', 'August', 'September', 'October', 'November', 'December'
    ];
    const shortMonths = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

    const year = d.getFullYear();
    const monthIndex = d.getMonth();
    const day = d.getDate();
    const dayOfWeek = d.getDay();

    const hours24 = d.getHours();
    const hours12 = hours24 % 12 || 12;
    const minutes = d.getMinutes();
    const seconds = d.getSeconds();
    const ampm = hours24 >= 12 ? 'PM' : 'AM';

    const pad = (n) => String(n).padStart(2, '0');

    let res = formatStr;
    res = res.replace(/EEEE/g, days[dayOfWeek]);
    res = res.replace(/EEE/g, shortDays[dayOfWeek]);
    res = res.replace(/MMMM/g, months[monthIndex]);
    res = res.replace(/MMM/g, shortMonths[monthIndex]);
    res = res.replace(/MM/g, pad(monthIndex + 1));
    res = res.replace(/yyyy/g, String(year));
    res = res.replace(/yy/g, String(year).slice(-2));
    res = res.replace(/hh/g, pad(hours12));
    res = res.replace(/\bh\b/g, String(hours12));
    res = res.replace(/HH/g, pad(hours24));
    res = res.replace(/mm/g, pad(minutes));
    res = res.replace(/ss/g, pad(seconds));
    res = res.replace(/a/g, ampm);
    res = res.replace(/\bd\b/g, String(day));

    return res;
};

