interface TrustpilotWidgetProps {
  className?: string;
}

export default function TrustpilotWidget({ className }: TrustpilotWidgetProps) {
  return (
    <div className={className}>
      {/* TrustBox widget - Review Collector */}
      <div
        className="trustpilot-widget"
        data-locale="en-US"
        data-template-id="56278e9abfbbba0bdcd568bc"
        data-businessunit-id="6415134a5c3148d8e2effeac"
        data-style-height="52px"
        data-style-width="100%"
        data-token="0eb68c2c-2f24-4f62-81cb-3aebbd00d782"
      >
        <a
          href="https://www.trustpilot.com/review/the10xschool.com"
          target="_blank"
          rel="noopener"
        >
          Trustpilot
        </a>
      </div>
      {/* End TrustBox widget */}
    </div>
  );
}