const AuthImagePattern = ({ title, subtitle }) => {
    return (
      <div className="hidden lg:flex items-center justify-center bg-gradient-to-br from-primary/10 to-secondary/10 p-12 relative overflow-hidden">
        {/* Animated Pattern */}
        <div className="absolute inset-0">
          <div className="grid grid-cols-6 gap-4">
            {[...Array(36)].map((_, i) => (
              <div
                key={i}
                className="aspect-square rounded-full bg-primary/20"
                style={{
                  animation: `wave 2s ease-in-out infinite`,
                  animationDelay: `${(i % 6) * 0.1}s`, // Staggered delay for wave effect
                }}
              />
            ))}
          </div>
        </div>
        {/* Content */}
        <div className="relative z-10 max-w-md text-center">
          <h2 className="text-3xl font-bold mb-4">{title}</h2>
          <p className="text-lg text-base-content/70">{subtitle}</p>
        </div>
      </div>
    );
  };
  
  // Add CSS for the wave animation
  const styles = `
    @keyframes wave {
      0%, 100% {
        transform: scale(0.5);
        opacity: 0.3;
      }
      50% {
        transform: scale(1);
        opacity: 0.8;
      }
    }
  `;
  
  // Inject styles into the document
  if (typeof document !== "undefined") {
    const styleSheet = document.createElement("style");
    styleSheet.textContent = styles;
    document.head.appendChild(styleSheet);
  }
  
  export default AuthImagePattern;