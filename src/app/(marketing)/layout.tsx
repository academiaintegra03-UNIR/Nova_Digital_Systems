import { SiteHeader } from "@/components/layout/site-header";
import { SiteFooter } from "@/components/layout/site-footer";
import { OrientationChatWidget } from "@/features/marketing/orientation-chat-widget";
import { PromoPopup } from "@/features/marketing/promo-popup";
import { getAuthenticatedProfile } from "@/lib/auth/get-profile";

export default async function MarketingLayout({ children }: { children: React.ReactNode }) {
  const profile = await getAuthenticatedProfile();

  return (
    <>
      <SiteHeader profile={profile} />
      <main className="flex-1">{children}</main>
      <SiteFooter />
      <OrientationChatWidget />
      <PromoPopup />
    </>
  );
}
