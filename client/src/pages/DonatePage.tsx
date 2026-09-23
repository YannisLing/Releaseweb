export default function DonatePage() {
  return (
    <div className="donate-container">
      <div className="donate-card">
        <div className="donate-header">
          <div className="donate-icon">❤️</div>
          <h2>支持开发者</h2>
          <p>如果这个工具对你有帮助，欢迎自愿打赏支持</p>
        </div>

        <div className="disclaimer">
          <p className="disclaimer-title">💡 温馨提示</p>
          <ul>
            <li>打赏纯属自愿，金额随意</li>
            <li>不提供任何附加服务或回报</li>
            <li>此收款码仅用于本站打赏</li>
          </ul>
        </div>

        <div className="donate-methods">
          <div className="donate-option">
            <div className="donate-platform">支付宝</div>
            <div className="qr-code-container">
              <img
                src="/donate-qr.png"
                alt="支付宝打赏二维码"
                className="qr-image"
                width="200px"
              />
            </div>
            <p className="donate-tip">支付宝扫码打赏</p>
          </div>
        </div>

        <div className="donate-thanks">
          <p>🎉 感谢感谢，你的每一份鼓励都是我前进的动力！让我们继续向着自由前进！</p>
        </div>

        <div className="safety-note">
          <p>⚠️ 此收款码仅用于本站自愿打赏，如发现其他渠道使用均为诈骗，请警惕！</p>
        </div>
      </div>
    </div>
  );
}
