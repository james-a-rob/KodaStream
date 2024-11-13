module.exports = {
    apps: [{
        name: "kodastream-api",
        script: "dist/api/main.js",
        exec_mode: "cluster",
        instances: 4,
        env: {
            NODE_ENV: "prod",
            APIKEY: process.env.APIKEY
        },
        node_args: "--import=extensionless/register"
    }]
}