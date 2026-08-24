module.exports = {
  apps: [
    {
      name: "ai_social_media_automation",
      script: "npm",
      args: "run start",
      cwd: "/var/www/html/ai_social_media_automation",
      exec_mode: "fork",
      watch: false,
      env: {
        NODE_ENV: "production",
        PORT: 3000
      }
    },
    {
      name: "social-scheduler",
      script: "./scripts/start-scheduler.ts",
      interpreter: "tsx",
      cwd: "/var/www/html/ai_social_media_automation",
      exec_mode: "fork",
      watch: false,
      env: {
        NODE_ENV: "production"
      }
    }
  ]
};
