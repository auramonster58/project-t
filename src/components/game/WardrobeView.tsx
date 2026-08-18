type WardrobeViewProps = { hunterLooking: boolean };

export function WardrobeView({ hunterLooking }: WardrobeViewProps) {
  return (
    <div className={`wardrobe-view ${hunterLooking ? 'wardrobe-view--spotted' : ''}`} aria-hidden="true">
      <div className="wardrobe-view__darkness" />
      <div className="wardrobe-view__gap">
        {hunterLooking && <div className="wardrobe-view__hunter">
          <img src="/assets/skeleton-mouth-screamer.png" alt="" />
        </div>}
      </div>
      <i className="wardrobe-view__door wardrobe-view__door--left" />
      <i className="wardrobe-view__door wardrobe-view__door--right" />
      <span className="wardrobe-view__breath">ТЫ ВНУТРИ ШКАФА · ДЫШИ ТИХО</span>
    </div>
  );
}
