module.exports = {
    apps: [{
        name: "kodastream-content-server",
        script: "dist/content-server/main.js",
        exec_mode: "cluster",
        instances: 4,
        env: {
            NODE_ENV: "prod"
        },
        node_args: "--import=extensionless/register"
    }]
}