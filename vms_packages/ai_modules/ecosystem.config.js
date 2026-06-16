module.exports = {
  apps: [
    {
      name: "ai-modules",
      script: "C:\\Program Files\\nodejs\\node_modules\\npm\\bin\\npm-cli.js",
      cwd: "D:\\Aios-new\\ai-modules",
      args: "run dev",
      exec_mode: "cluster",
      // instances: 1,
      interpreter: "none",
      watch: true,
      autorestart: false,
      max_memory_restart: "500M",
      restart_delay: 300000, // Restart the app after 5 minutes (300,000 ms)
      // args: ['run', 'start'],
      env: {
          HOST: '0.0.0.0',
          PORT: 3080
      },
    },
  ],
};
