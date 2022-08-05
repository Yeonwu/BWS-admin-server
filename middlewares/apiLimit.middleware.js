import RateLimit from "express-rate-limit";

export const apiLimiter = RateLimit({
    windowMs: 1000, // 초당
    max: 20, // 20번까지 호출 가능
    handler(req, res) {
        // 제한 초과 시
        res.status(this.statusCode).json({
            code: this.statusCode,
            message: "초당 20회까지 호출 가능합니다.",
        });
    },
});
