import { THEMES } from "../constants";
import { useThemeStore } from "../store/useThemeStore";
import { Send } from "lucide-react";

const PREVIEW_MESSAGES = [
  { id: 1, content: "Hey! How's it going?", isSent: false },
  { id: 2, content: "I'm doing great! Just working on some new features.", isSent: true },
];

const SettingsPage = () => {
  const { theme, setTheme } = useThemeStore();

  const handleThemeChange = (newTheme) => {
    setTheme(newTheme);
    document.documentElement.setAttribute("data-theme", newTheme);
  };

  return (
    <div className="min-h-screen container mx-auto px-4 py-16 max-w-6xl">
      <div className="space-y-12">
        {/* Heading */}
        <div className="text-center">
          <h2 className="text-4xl font-extrabold tracking-tight text-primary">Theme Settings</h2>
          <p className="text-sm text-base-content/70 mt-2">Pick a theme to match your chatbot’s vibe</p>
        </div>

        {/* Theme Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-5">
          {THEMES.map((t) => (
            <button
              key={t}
              onClick={() => handleThemeChange(t)}
              className={`group flex flex-col items-center gap-2 p-3 rounded-xl transition-all duration-300 border-2 bg-base-100 hover:scale-[1.03]
                ${theme === t ? "border-primary shadow-lg" : "border-base-200 hover:border-primary/60"}
              `}
            >
              <div
                className="relative h-10 w-full rounded-md overflow-hidden shadow-sm"
                data-theme={t}
              >
                <div className="absolute inset-0 grid grid-cols-4 gap-px p-1">
                  <div className="rounded bg-primary"></div>
                  <div className="rounded bg-secondary"></div>
                  <div className="rounded bg-accent"></div>
                  <div className="rounded bg-neutral"></div>
                </div>
              </div>
              <span className="text-xs font-semibold text-center capitalize w-full truncate text-base-content">
                {t}
              </span>
            </button>
          ))}
        </div>

        {/* Live Chat Preview */}
        <div>
          <h3 className="text-2xl font-bold mb-6 text-center text-base-content">Live Preview</h3>
          <div
            data-theme={theme}
            className="rounded-2xl border border-base-300 overflow-hidden bg-base-100 shadow-xl transition-all"
          >
            <div className="p-6 bg-base-200">
              <div className="max-w-lg mx-auto space-y-4">
                {/* Chat Container */}
                <div className="bg-base-100 rounded-2xl overflow-hidden border border-base-300 shadow-md">
                  {/* Chat Header */}
                  <div className="px-5 py-4 border-b border-base-300 bg-base-100">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-full bg-primary flex items-center justify-center text-primary-content font-semibold">
                        J
                      </div>
                      <div>
                        <h4 className="text-sm font-medium text-base-content">John Doe</h4>
                        <p className="text-xs text-base-content/60">Online</p>
                      </div>
                    </div>
                  </div>

                  {/* Chat Messages */}
                  <div className="p-4 space-y-4 min-h-[200px] max-h-[200px] overflow-y-auto bg-base-100 scrollbar-thin scrollbar-thumb-base-300 scrollbar-track-base-200">
                    {PREVIEW_MESSAGES.map((message) => (
                      <div
                        key={message.id}
                        className={`flex ${message.isSent ? "justify-end" : "justify-start"}`}
                      >
                        <div
                          className={`max-w-[80%] rounded-xl px-4 py-2 text-sm shadow-sm
                            ${message.isSent ? "bg-primary text-primary-content" : "bg-base-200 text-base-content"}
                          `}
                        >
                          <p>{message.content}</p>
                          <p
                            className={`text-[10px] mt-1 ${
                              message.isSent ? "text-primary-content/70" : "text-base-content/60"
                            }`}
                          >
                            12:00 PM
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Chat Input */}
                  <div className="p-4 border-t border-base-300 bg-base-100">
                    <div className="flex items-center gap-3">
                      <input
                        type="text"
                        className="input input-bordered w-full text-sm h-10"
                        placeholder="Type a message..."
                        value="This is a preview"
                        readOnly
                      />
                      <button className="btn btn-primary h-10 min-h-0 px-4">
                        <Send size={18} />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SettingsPage;
