const crypto = require("crypto");
const Redis = require("ioredis");

class RedisTaskQueue {
    constructor(queueName = "task-queue") {
        this.redis = new Redis();
        this.queueName = queueName;
    }

    async enqueue(task) {

        if (!task.id) {
            task.id = crypto.randomUUID();
        }

        await this.redis.rpush(this.queueName, JSON.stringify(task));
    }

    async dequeueBlocking(timeout = 0) {
        const result = await this.redis.blpop(this.queueName, timeout);
        return result ? JSON.parse(result[1]) : null;
    }
}

const redis = new RedisTaskQueue();

const dataset = Array.from({ length: 100000 }, () => Math.random() * 1000);
const analysisData = {
    dataset,
    algorithms: ["mean", "variance", "correlation", "regression"],
};

redis.enqueue({
    data: analysisData,
    taskType: "dataAnalysis",
}).then(() => console.log("ready")).catch((err) => console.log("An error happened : ", err?.message, err)).finally(() => process.exit(0));