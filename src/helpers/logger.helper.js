const buildLog = (file, func, level, domain, message) => {
    const now = new Date();
    const date = now.toLocaleDateString('vi-VN', { timeZone: 'Asia/Ho_Chi_Minh' });
    const time = now.toLocaleTimeString('vi-VN', { timeZone: 'Asia/Ho_Chi_Minh' });
    const log = {
        filename: `${path.basename(file)}`,
        caller: `${func}`,
        level: level,
        domain: `${domain ? domain : 'app'}`,
        message: message instanceof Error ? message.stack : message,
        time: `${date} ${time}`,
    };
    return JSON.stringify(log);
}

export const Logger = {
    info: (file, domain, message) => {
        const func = info.caller.name;
        console.log(buildLog(file, func, "info", domain, message));
    },
    error: (file, domain, message) => {
        const func = error.caller.name;
        console.log(buildLog(file, func, "error", domain, message));
    },
}