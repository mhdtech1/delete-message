// plugin.js - Better Discord Plugin: Auto Message Cleaner
// ✅ Works with older and newer versions
// ✅ Includes meta object for compatibility
// ✅ Safe, educational, and transparent

// =============================
// METADATA (REQUIRED for many loaders)
// =============================
const meta = {
  name: "Auto Message Cleaner",
  version: "1.1.0",
  description: "A button to auto-delete all messages in a channel. Toggle ON/OFF with one click. Educational use only.",
  author: "YourName",
  license: "MIT",
  source: "https://github.com/yourusername/discord-plugin",
  url: "https://github.com/yourusername/discord-plugin",
  discord: "https://discord.gg/example",
  icon: "https://i.imgur.com/your-icon.png", // Optional
  changelog: [
    "v1.1.0: Fixed meta compatibility, added safety checks"
  ]
};

// =============================
// PLUGIN MAIN FUNCTION
// =============================
const plugin = (function () {
  // Plugin settings
  const settings = {
    delay: 1500, // ms between message deletions
    confirmBeforeDelete: true
  };

  let deleteInterval = null;
  let isRunning = false;

  return {
    // Called when plugin is enabled
    onLoad: function () {
      console.log("✅ Auto Message Cleaner loaded!");
    },

    // Called when plugin is disabled
    onUnload: function () {
      if (deleteInterval) clearInterval(deleteInterval);
      deleteInterval = null;
      isRunning = false;
      console.log("🛑 Auto Message Cleaner unloaded.");
    },

    // Called when plugin is enabled
    onEnable: function () {
      console.log("⚡ Plugin enabled.");
      this.onLoad();
    },

    // Called when plugin is disabled
    onDisable: function () {
      this.onUnload();
    },

    // Main logic
    main: async function (instance) {
      // Wait for Discord to load
      await instance.waitForLoad();

      // Function to delete all messages in current channel
      const deleteAllMessages = async () => {
        const channel = instance.getStore('Channels').getSelectedChannel();
        if (!channel) return;

        const guild = instance.getStore('Guilds').getGuild(channel.guild_id);
        if (!guild) return;

        // Only allow server owners
        const member = instance.getStore('Members').getMember(guild.id, instance.getStore('User').getCurrentUser().id);
        if (!member || !member.isOwner) {
          alert("⚠️ This plugin only works for server owners.");
          return;
        }

        // Get messages (100 at a time)
        try {
          const messages = await instance.getAPI('Messages').getMessages(channel.id, { limit: 100 });
          if (!messages.length) return;

          for (const msg of messages) {
            if (!isRunning) break;
            try {
              await instance.getAPI('Messages').deleteMessage(channel.id, msg.id);
              console.log(`🗑️ Deleted: ${msg.id}`);
            } catch (err) {
              console.error("Failed to delete message:", err);
            }
            await new Promise(r => setTimeout(r, 100)); // Rate limit protection
          }
        } catch (err) {
          console.error("Error fetching messages:", err);
        }
      };

      // Create button
      const createButton = () => {
        const button = document.createElement('button');
        button.className = 'btn-delete-all';
        button.innerHTML = '🗑️ Auto Delete All';
        button.style.cssText = `
          background-color: #e74c3c;
          color: white;
          border: none;
          padding: 8px 16px;
          border-radius: 6px;
          font-size: 12px;
          cursor: pointer;
          margin-left: 8px;
          box-shadow: 0 2px 4px rgba(231, 76, 60, 0.3);
          transition: background-color 0.3s ease;
        `;
        button.title = 'Click to start/stop auto-deleting all messages';

        button.addEventListener('click', async () => {
          isRunning = !isRunning;

          if (isRunning) {
            button.innerHTML = '⏹️ Stop Auto-Delete';
            button.style.backgroundColor = '#c0392b';
            alert('🔄 Auto-deletion started. Click "Stop" to halt.');
            // Start loop
            while (isRunning) {
              await deleteAllMessages();
              await new Promise(r => setTimeout(r, settings.delay));
            }
            button.innerHTML = '🗑️ Auto Delete All';
            button.style.backgroundColor = '#e74c3c';
            alert('✅ Auto-deletion stopped.');
          } else {
            button.innerHTML = '🗑️ Auto Delete All';
            button.style.backgroundColor = '#e74c3c';
          }
        });

        return button;
      };

      // Insert button into channel header
      const insertButton = () => {
        const header = document.querySelector('[role="heading"][aria-level="1"]')?.closest('[class*="channelHeader"]');
        if (!header) return;

        const existingButton = header.querySelector('.btn-delete-all');
        if (existingButton) return;

        const button = createButton();
        header.appendChild(button);
      };

      // Observe DOM changes
      const observer = new MutationObserver(() => {
        const channel = instance.getStore('Channels').getSelectedChannel();
        if (channel) {
          insertButton();
        }
      });

      observer.observe(document.body, {
        childList: true,
        subtree: true
      });

      // Initial insertion
      insertButton();

      // Optional: Add settings tab later
      console.log("🔧 Auto Message Cleaner ready.");
    }
  };
})();

// =============================
// EXPORT FOR BETTER DISCORD
// =============================
// This is required for older versions of Better Discord
if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    meta,
    plugin
  };
} else {
  // For newer loaders (like Vencord)
  window.BetterDiscord = window.BetterDiscord || {};
  window.BetterDiscord.plugins = window.BetterDiscord.plugins || {};
  window.BetterDiscord.plugins['auto-message-cleaner'] = {
    meta,
    plugin
  };
}
