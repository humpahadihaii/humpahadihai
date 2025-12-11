import ContentListPage from "./ContentListPage";

export default function ThoughtsPage() {
  return (
    <ContentListPage
      contentType="thought"
      title="Voices from the Hills"
      description="Stories, thoughts, and reflections from Pahadi hearts across the world"
      heroGradient="from-primary/70 to-accent/60"
      showSubmitButton={true}
      submitButtonLabel="Share Your Thought"
      submitButtonUrl="/submit-thought"
    />
  );
}
