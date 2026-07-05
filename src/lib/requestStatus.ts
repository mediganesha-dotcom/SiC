export const STATUS_LABELS: Record<string, string> = {
  OPEN: "Offen",
  MATCHED: "Vergeben",
  CONFIRMED: "Bestätigt",
  COMPLETED: "Abgeschlossen",
  CANCELLED: "Storniert",
};

export const STATUS_BADGE_CLASSES: Record<string, string> = {
  OPEN: "bg-primary text-primary-foreground",
  MATCHED: "bg-secondary text-secondary-foreground",
  CONFIRMED: "bg-accent text-accent-foreground",
  COMPLETED: "bg-muted text-muted-foreground",
  CANCELLED: "bg-destructive/10 text-destructive",
};
