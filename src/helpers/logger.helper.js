import path from "path";

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

const getCaller = () => {
    const err = new Error();
    const stack = err.stack.split("\n")[3];
    const match = stack.match(/at (\S+)/);
    return match ? match[1] : "Anonymous";
}

export const Logger = {
    info: (file, domain, message) => {
        const func = getCaller();
        console.log(buildLog(file, func, "info", domain, message));
    },
    error: (file, domain, message) => {
        const func = getCaller();
        console.log(buildLog(file, func, "error", domain, message));
    },
}