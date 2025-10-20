// plugin.js - Better Discord Plugin: Auto Message Cleaner
// ✅ Educational, Safe, and Transparent
// 📌 Only runs in user's browser, no external servers

// Plugin metadata
const plugin = {
  name: "Auto Message Cleaner",
  version: "1.0.0",
  description: "A button to auto-delete all messages in a channel. Toggle ON/OFF with one click. Educational use only.",
  author: "YourName",
  enabled: true,
  settings: {}
};

// Main plugin function
const main = async (instance) => {
  // Wait for Discord to load
  await instance.waitForLoad();

  // Store interval ID to stop auto-deletion
  let deleteInterval = null;
  let isRunning = false;

  // Function to delete all messages in current channel
  const deleteAllMessages = async () => {
    const channel = instance.getStore('Channels').getSelectedChannel();
    if (!channel) return;

    const guild = instance.getStore('Guilds').getGuild(channel.guild_id);
    if (!guild) return;

    // Only allow for server owners
    const member = instance.getStore('Members').getMember(guild.id, instance.getStore('User').getCurrentUser().id);
    if (!member || !member.isOwner) {
      alert("⚠️ This plugin only works for server owners.");
      return;
    }

    // Get all messages (pagination required)
    const messages = await instance.getAPI('Messages').getMessages(channel.id, { limit: 100 });
    if (!messages.length) return;

    // Delete messages one by one
    for (const msg of messages) {
      if (!isRunning) break; // Exit if stopped
      try {
        await instance.getAPI('Messages').deleteMessage(channel.id, msg.id);
        console.log(`Deleted message: ${msg.id}`);
      } catch (err) {
        console.error("Failed to delete message:", err);
      }
      // Small delay to avoid rate limits
      await new Promise(r => setTimeout(r, 100));
    }
  };

  // Create button element
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
        // Run deletion loop
        while (isRunning) {
          await deleteAllMessages();
          await new Promise(r => setTimeout(r, 1500)); // Wait 1.5s between batches
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
    if (existingButton) return; // Avoid duplicates

    const button = createButton();
    header.appendChild(button);
  };

  // Observe DOM for channel changes
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

  // Optional: add cleanup on plugin disable
  return () => {
    if (deleteInterval) clearInterval(deleteInterval);
    deleteInterval = null;
    isRunning = false;
  };
};

// Export plugin
export default {
  plugin,
  main
};
