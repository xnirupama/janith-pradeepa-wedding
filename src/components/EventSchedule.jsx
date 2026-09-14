import SectionReveal from "./SectionReveal";
import VideoBackdrop from "./VideoBackdrop";

export default function EventSchedule({ items, invitation, active }) {
  return (
    <section className="schedule-section cinematic-section section-shell" aria-labelledby="schedule-title">
      <VideoBackdrop src={invitation.sectionVideos.schedule} fallbackSrc={invitation.videos.feature} poster={invitation.backgrounds.section} active={active} tone={invitation.theme} overlay="strong" className="section-video" />
      <SectionReveal className="section-heading">
        <p className="section-kicker">The day unfolds</p>
        <h2 id="schedule-title">Wedding Day</h2>
        <span className="heading-flourish" aria-hidden="true" />
      </SectionReveal>
      <div className="timeline">
        {items.map((item, index) => (
          <SectionReveal key={item.title} className="timeline-item" delay={index * 0.08}>
            <h3>{item.title}</h3>
            <time>{item.time}</time>
          </SectionReveal>
        ))}
      </div>
    </section>
  );
}
