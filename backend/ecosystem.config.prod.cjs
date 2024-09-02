module.exports = {
    apps: [{
        name: "koda-backend",
        script: "dist/main.js",
        exec_mode: "cluster",
        instances: 4,
        env: {
            NODE_ENV: "prod",
        },
        node_args: "--import=extensionless/register"
    }]
}