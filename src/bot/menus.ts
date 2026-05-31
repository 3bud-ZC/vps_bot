import { Markup } from 'telegraf';

export const Menus = {
  main: () => {
    return Markup.inlineKeyboard([
      [Markup.button.callback('📊 نظرة عامة (Status)', 'action_status')],
      [
        Markup.button.callback('📈 الموارد', 'menu_resources'),
        Markup.button.callback('🛠 الخدمات', 'menu_services')
      ],
      [
        Markup.button.callback('📂 إدارة الملفات', 'menu_files'),
        Markup.button.callback('📜 السجلات', 'menu_logs')
      ],
      [
        Markup.button.callback('⚡ أدوات متقدمة', 'menu_advanced'),
        Markup.button.callback('🔔 التنبيهات', 'menu_alerts')
      ]
    ]);
  },

  resources: () => {
    return Markup.inlineKeyboard([
      [Markup.button.callback('⚙️ المعالج (CPU)', 'action_cpu'), Markup.button.callback('🧠 الذاكرة (RAM)', 'action_ram')],
      [Markup.button.callback('💾 الأقراص (Disk)', 'action_disk'), Markup.button.callback('🌐 الشبكة (Network)', 'action_network')],
      [Markup.button.callback('⏱ مدة التشغيل', 'action_uptime'), Markup.button.callback('📊 رسم بياني', 'action_chart')],
      [Markup.button.callback('🔙 رجوع للرئيسية', 'menu_main')]
    ]);
  },

  services: () => {
    return Markup.inlineKeyboard([
      [Markup.button.callback('🌐 Nginx', 'action_nginx_status'), Markup.button.callback('🐳 Docker', 'action_docker')],
      [Markup.button.callback('🤖 PM2', 'action_pm2')],
      [Markup.button.callback('🔙 رجوع للرئيسية', 'menu_main')]
    ]);
  },

  files: () => {
    return Markup.inlineKeyboard([
      [Markup.button.callback('📂 متصفح الملفات', 'action_files_explorer')],
      [Markup.button.callback('🔙 رجوع للرئيسية', 'menu_main')]
    ]);
  },

  logs: () => {
    return Markup.inlineKeyboard([
      [Markup.button.callback('🌐 Nginx Access', 'log_nginx_access'), Markup.button.callback('❌ Nginx Error', 'log_nginx_error')],
      [Markup.button.callback('🔐 Auth Logs', 'log_auth'), Markup.button.callback('🖥 Syslog', 'log_syslog')],
      [Markup.button.callback('🔙 رجوع للرئيسية', 'menu_main')]
    ]);
  },

  advanced: () => {
    return Markup.inlineKeyboard([
      [Markup.button.callback('🧹 تفريغ RAM Cache', 'action_clear_ram'), Markup.button.callback('🔄 تحديث النظام', 'action_apt_update')],
      [Markup.button.callback('🗑 تنظيف Docker', 'action_docker_prune'), Markup.button.callback('⏰ المهام المجدولة', 'action_cron')],
      [Markup.button.callback('🛡️ جدار الحماية (UFW)', 'menu_ufw')],
      [Markup.button.callback('🗄️ نسخ احتياطي (MySQL)', 'action_backup_mysql'), Markup.button.callback('🐘 نسخ احتياطي (Postgres)', 'action_backup_postgres')],
      [Markup.button.callback('🔙 رجوع للرئيسية', 'menu_main')]
    ]);
  },

  ufw: () => {
    return Markup.inlineKeyboard([
      [Markup.button.callback('ℹ️ حالة UFW', 'action_ufw_status')],
      [Markup.button.callback('✅ تفعيل', 'action_ufw_enable'), Markup.button.callback('❌ إيقاف', 'action_ufw_disable')],
      [Markup.button.callback('🔙 رجوع للأدوات المتقدمة', 'menu_advanced')]
    ]);
  },

  alerts: () => {
    return Markup.inlineKeyboard([
      [Markup.button.callback('ℹ️ حالة التنبيهات الحالية', 'action_alerts_status')],
      [
        Markup.button.callback('✅ تفعيل', 'action_alerts_on'),
        Markup.button.callback('❌ إيقاف', 'action_alerts_off')
      ],
      [
        Markup.button.callback('🛡️ تفعيل مراقبة SSH', 'action_ssh_on'),
        Markup.button.callback('🛑 إيقاف مراقبة SSH', 'action_ssh_off')
      ],
      [Markup.button.callback('🔙 رجوع للرئيسية', 'menu_main')]
    ]);
  }
};
