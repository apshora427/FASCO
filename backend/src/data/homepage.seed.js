import { HomepageContent } from "../models/homepageContent.model.js";

export const defaultHomepageContent = {
  hero: {
    title: "ULTIMATE",
    headline: "SALE",
    subtitle: "New Collection",
    buttonLabel: "Shop Now",
    buttonHref: "/shop",
    imageAlts: {
      left: "Model in casual winter streetwear",
      top: "The new collection",
      bottom: "Shoppers with bags",
      right: "Model in an orange turtleneck",
    },
    images: {
      left: "hero-left",
      top: "hero-top",
      bottom: "hero-bottom",
      right: "hero-right",
    },
  },
  brands: [
    { name: "Chanel", image: "brand-1" },
    { name: "Louis Vuitton", image: "brand-2" },
    { name: "Prada", image: "brand-3" },
    { name: "Calvin Klein", image: "brand-4" },
    { name: "Denim", image: "brand-5" },
  ],
  deals: {
    title: "Deals Of The Month",
    description:
      "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Scelerisque duis ultrices sollicitudin aliquam sem. Scelerisque duis ultrices sollicitudin.",
    buttonLabel: "Buy Now",
    buttonHref: "/shop?collection=On%20sale",
    urgency: "Hurry, Before It’s Too Late!",
    emptyMessage: "There are no discounted products right now. Check back soon or browse the full collection.",
    saleLabel: "Spring Sale",
    countdownLabels: ["Days", "Hr", "Mins", "Sec"],
  },
  arrivals: {
    title: "New Arrivals",
    description:
      "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Scelerisque duis ultrices sollicitudin aliquam sem. Scelerisque duis ultrices sollicitudin.",
    emptyMessage: "Nothing here yet — check back soon.",
    buttonLabel: "View More",
    buttonHref: "/shop",
  },
  promo: {
    collectionLabel: "Women Collection",
    descriptionLabel: "DESCRIPTION",
    buttonLabel: "Buy Now",
    sizeLabel: "Size:",
    defaultSize: "M",
    description:
      "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Scelerisque duis ultrices sollicitudin aliquam sem. Scelerisque duis ultrices sollicitudin. Lorem ipsum dolor sit amet, consectetur adipiscing elit. Scelerisque duis.",
    image: "promo-base",
    featuredProductId: 16,
    callouts: [
      { image: "promo-tag-cap", x: 461, y: 55, width: 125, height: 41 },
      { image: "promo-tag-suspender", x: 44, y: 167, width: 125, height: 41 },
      { image: "promo-tag-hugo-boss", x: 414, y: 236, width: 126, height: 42 },
      { image: "promo-tag-hugo-boss-lower", x: 0, y: 334, width: 126, height: 42 },
      { image: "promo-tag-santoni", x: 418, y: 507, width: 128, height: 42 },
    ],
  },
  features: [
    { icon: "feature-1", title: "High Quality", description: "crafted from top materials" },
    { icon: "feature-2", title: "Warranty Protection", description: "Over 2 years" },
    { icon: "feature-3", title: "Free Shipping", description: "Order over 150 $" },
    { icon: "feature-4", title: "24 / 7 Support", description: "Dedicated support" },
  ],
  instagram: {
    title: "Follow Us On Instagram",
    description:
      "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Scelerisque duis ultrices sollicitudin aliquam sem. Scelerisque duis ultrices sollicitudin.",
    posts: [
      { image: "follow-1", href: "https://www.instagram.com/", height: 308 },
      { image: "follow-2", href: "https://www.instagram.com/", height: 380 },
      { image: "follow-3", href: "https://www.instagram.com/", height: 308 },
      { image: "follow-4", href: "https://www.instagram.com/", height: 380 },
      { image: "follow-5", href: "https://www.instagram.com/", height: 308 },
      { image: "follow-6", href: "https://www.instagram.com/", height: 380 },
      { image: "follow-7", href: "https://www.instagram.com/", height: 308 },
    ],
  },
  testimonials: {
    title: "This Is What Our Customers Say",
    description: "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Scelerisque duis",
    items: [
      {
        name: "James K.",
        role: "Traveler",
        image: "customer-1",
        rating: 5,
        quote:
          "You won't regret it. I would like to personally thank you for your outstanding product. Absolutely wonderful!",
      },
      {
        name: "Amelia R.",
        role: "Stylist",
        image: "customer-2",
        rating: 5,
        quote:
          "The quality feels premium and delivery was faster than expected. The fit is exactly as shown on the site — I get compliments every time.",
      },
      {
        name: "Jason W.",
        role: "Photographer",
        image: "customer-3",
        rating: 5,
        quote:
          "Keep doing! Thank you for making it truly amazing. FASCO is one of an online store I keep coming back to, the team made me great.",
      },
    ],
  },
  recommendations: {
    title: "Picked For You",
    similarCustomers: "Chosen from your activity and shoppers with similar interests.",
    activity: "Chosen from your browsing, favorites, and purchase history.",
    popular: "Popular picks to help us learn what you love.",
    loading: "Finding your best matches…",
  },
  newsletter: {
    title: "Subscribe To Our Newsletter",
    description:
      "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Scelerisque duis ultrices sollicitudin aliquam sem. Scelerisque duis ultrices sollicitudin.",
    emailPlaceholder: "michael@ymail.com",
    buttonLabel: "Subscribe Now",
    backgroundImages: {
      left: "newsletter-left",
      right: "newsletter-right",
    },
  },
  site: {
    brandName: "FASCO",
    copyright: "All Rights Reserved",
  },
  navigation: {
    home: [
      { label: "Home", href: "/" },
      { label: "Deals", href: "/#deals" },
      { label: "New Arrivals", href: "/#new-arrivals" },
      { label: "Reviews", href: "/#testimonials" },
    ],
    footer: [
      { label: "Shop", href: "/shop" },
      { label: "Shopping cart", href: "/cart" },
      { label: "Wishlist", href: "/wishlist" },
      { label: "My account", href: "/account" },
    ],
  },
};

const mergeDefaults = (existing, defaults) => {
  if (Array.isArray(defaults)) {
    return Array.isArray(existing) ? existing : defaults;
  }
  if (defaults && typeof defaults === "object") {
    const source =
      existing && typeof existing === "object" && !Array.isArray(existing)
        ? existing
        : {};
    return Object.fromEntries(
      Object.entries(defaults).map(([key, value]) => [
        key,
        Object.hasOwn(source, key) ? mergeDefaults(source[key], value) : value,
      ])
    );
  }
  return existing === undefined ? defaults : existing;
};

export const ensureHomepageContent = async () => {
  const existing = await HomepageContent.findOne({ key: "default" }).lean();
  const content = mergeDefaults(existing?.content, defaultHomepageContent);
  await HomepageContent.updateOne(
    { key: "default" },
    { $set: { content }, $setOnInsert: { key: "default" } },
    { upsert: true }
  );
};
