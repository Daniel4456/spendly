import os
from pptx import Presentation
from pptx.util import Inches, Pt
from pptx.enum.text import PP_ALIGN
from pptx.dml.color import RGBColor
from pptx.enum.shapes import MSO_SHAPE

def create_layman_presentation():
    prs = Presentation()
    # 16:9 Widescreen
    prs.slide_width = Inches(13.333)
    prs.slide_height = Inches(7.5)

    # Spendly Palette
    BG_DARK = RGBColor(11, 16, 32)        # #0B1020
    CARD_BG = RGBColor(21, 29, 50)        # #151D32
    TEXT_MAIN = RGBColor(248, 250, 252)   # #F8FAFC
    TEXT_MUTED = RGBColor(148, 163, 184)  # #94A3B8
    ACCENT_PURPLE = RGBColor(108, 99, 255)# #6C63FF
    ACCENT_GREEN = RGBColor(34, 197, 94)  # #22C55E
    ACCENT_RED = RGBColor(244, 63, 94)    # #F43F5E
    BORDER_COLOR = RGBColor(40, 50, 80)

    blank_layout = prs.slide_layouts[6]

    def add_base_slide(title_text="", badge_text=""):
        slide = prs.slides.add_slide(blank_layout)
        bg = slide.shapes.add_shape(MSO_SHAPE.RECTANGLE, 0, 0, Inches(13.333), Inches(7.5))
        bg.fill.solid()
        bg.fill.fore_color.rgb = BG_DARK
        bg.line.fill.background()

        if badge_text:
            cat_box = slide.shapes.add_textbox(Inches(0.8), Inches(0.45), Inches(11.7), Inches(0.35))
            tf_c = cat_box.text_frame
            tf_c.word_wrap = True
            p_c = tf_c.paragraphs[0]
            p_c.text = badge_text.upper()
            p_c.font.size = Pt(11)
            p_c.font.bold = True
            p_c.font.color.rgb = ACCENT_PURPLE

        if title_text:
            title_box = slide.shapes.add_textbox(Inches(0.8), Inches(0.75), Inches(11.7), Inches(0.8))
            tf_t = title_box.text_frame
            tf_t.word_wrap = True
            p_t = tf_t.paragraphs[0]
            p_t.text = title_text
            p_t.font.size = Pt(28)
            p_t.font.bold = True
            p_t.font.color.rgb = TEXT_MAIN

        return slide

    def set_speaker_notes(slide, notes_text):
        notes_slide = slide.notes_slide
        tf = notes_slide.notes_text_frame
        tf.text = notes_text

    # -------------------------------------------------------------
    # SLIDE 1: Title Slide (Simple & Friendly)
    # -------------------------------------------------------------
    s1 = prs.slides.add_slide(blank_layout)
    bg1 = s1.shapes.add_shape(MSO_SHAPE.RECTANGLE, 0, 0, Inches(13.333), Inches(7.5))
    bg1.fill.solid()
    bg1.fill.fore_color.rgb = BG_DARK
    bg1.line.fill.background()

    card1 = s1.shapes.add_shape(MSO_SHAPE.ROUNDED_RECTANGLE, Inches(1.5), Inches(1.2), Inches(10.333), Inches(5.1))
    card1.fill.solid()
    card1.fill.fore_color.rgb = CARD_BG
    card1.line.color.rgb = ACCENT_PURPLE
    card1.line.width = Pt(1.5)

    tf1 = card1.text_frame
    tf1.word_wrap = True
    p1 = tf1.paragraphs[0]
    p1.text = "SPENDLY"
    p1.alignment = PP_ALIGN.CENTER
    p1.font.size = Pt(56)
    p1.font.bold = True
    p1.font.color.rgb = ACCENT_PURPLE

    p1_sub = tf1.add_paragraph()
    p1_sub.text = "“Take control of your money.”"
    p1_sub.alignment = PP_ALIGN.CENTER
    p1_sub.font.size = Pt(22)
    p1_sub.font.italic = True
    p1_sub.font.color.rgb = TEXT_MAIN

    p1_desc = tf1.add_paragraph()
    p1_desc.text = "\nThe simple, beautiful app that helps everyday people track spending,\nsave more money, and stop financial stress."
    p1_desc.alignment = PP_ALIGN.CENTER
    p1_desc.font.size = Pt(16)
    p1_desc.font.color.rgb = TEXT_MUTED

    p1_live = tf1.add_paragraph()
    p1_live.text = "\nTry It Live: https://spendly-nine-beta.vercel.app"
    p1_live.alignment = PP_ALIGN.CENTER
    p1_live.font.size = Pt(15)
    p1_live.font.bold = True
    p1_live.font.color.rgb = ACCENT_GREEN

    set_speaker_notes(s1, "Welcome everyone. Have you ever looked at your bank account at the end of the month and wondered: 'Where did all my money go?' Today, I'm introducing Spendly—a friendly, easy-to-use app designed to help you take control of your finances without any complicated math.")

    # -------------------------------------------------------------
    # SLIDE 2: The Everyday Problem (Relatable)
    # -------------------------------------------------------------
    s2 = add_base_slide("“Where Did All My Money Go?”", "The Problem")

    problems = [
        ("💸 Mystery Disappearing Cash", "Little daily expenses—lunch, transport, snacks, and subscriptions—quietly drain your account before month-end."),
        ("📑 Complicated Accounting Apps", "Most money apps look like boring corporate tax spreadsheets with confusing terms like 'double-entry ledger' and 'debit reconciliation'."),
        ("🔒 Fear of Sharing Bank Passwords", "Many apps force you to give away your private bank login credentials just to track simple grocery spending."),
        ("🚨 Surprise Out-of-Money Moments", "People usually only realize they overspent when their card gets declined or their balance hits zero.")
    ]

    for i, (title, desc) in enumerate(problems):
        y = 1.7 + (i * 1.32)
        c = s2.shapes.add_shape(MSO_SHAPE.ROUNDED_RECTANGLE, Inches(0.8), Inches(y), Inches(11.7), Inches(1.15))
        c.fill.solid()
        c.fill.fore_color.rgb = CARD_BG
        c.line.color.rgb = BORDER_COLOR
        tf = c.text_frame
        tf.word_wrap = True
        p_t = tf.paragraphs[0]
        p_t.text = title
        p_t.font.size = Pt(16)
        p_t.font.bold = True
        p_t.font.color.rgb = ACCENT_RED
        p_d = tf.add_paragraph()
        p_d.text = desc
        p_d.font.size = Pt(13)
        p_d.font.color.rgb = TEXT_MUTED

    set_speaker_notes(s2, "Almost everyone experiences this frustration. Traditional tools make logging a simple ₦5,000 lunch feel like filing tax paperwork. People don't need accounting degrees—they just need clarity.")

    # -------------------------------------------------------------
    # SLIDE 3: The Solution — Meet Spendly
    # -------------------------------------------------------------
    s3 = add_base_slide("Money Tracking Made Simple & Friendly", "The Solution")

    solutions = [
        ("⏱️ Log It in 5 Seconds", "Type the amount and tap a category like Food or Fuel. That's it—done before your food even arrives!", ACCENT_PURPLE),
        ("📊 Colorful Charts, Zero Math", "Instant visual graphs show you exactly where your cash goes without doing any calculations.", ACCENT_GREEN),
        ("🛡️ Gentle Budget Warnings", "Set a monthly budget (like ₦50,000 for Food). Spendly gives you a friendly warning before you overspend.", ACCENT_PURPLE),
        ("📱 Works on Phone & Computer", "Use it on your phone while out shopping, or on your laptop at home. Your records stay synced.", ACCENT_GREEN)
    ]

    for i, (title, body, color) in enumerate(solutions):
        x = 0.8 + ((i % 2) * 5.95)
        y = 1.8 + ((i // 2) * 2.55)
        c = s3.shapes.add_shape(MSO_SHAPE.ROUNDED_RECTANGLE, Inches(x), Inches(y), Inches(5.75), Inches(2.3))
        c.fill.solid()
        c.fill.fore_color.rgb = CARD_BG
        c.line.color.rgb = color
        c.line.width = Pt(1.5)
        tf = c.text_frame
        tf.word_wrap = True
        p = tf.paragraphs[0]
        p.text = title
        p.font.size = Pt(18)
        p.font.bold = True
        p.font.color.rgb = color
        p2 = tf.add_paragraph()
        p2.text = f"\n{body}"
        p2.font.size = Pt(14)
        p2.font.color.rgb = TEXT_MAIN

    set_speaker_notes(s3, "Spendly makes tracking effortless. It feels like a modern digital bank like Revolut or Apple Card rather than an accounting program.")

    # -------------------------------------------------------------
    # SLIDE 4: What You Can Do
    # -------------------------------------------------------------
    s4 = add_base_slide("Features Anyone Can Use in Seconds", "Core Features")

    features = [
        ("🤖 Spendly AI Financial Copilot", "Natural language logging ('Spent ₦4,500 on lunch'), instant spending audits, and savings advice."),
        ("💳 Your Total Balance Card", "See your total money, total income, and total expenses in big, clear numbers."),
        ("📈 Spending Trend Graph", "See if you're spending more or less this week compared to last week or last month."),
        ("🍩 The 'Pie of Spending'", "A friendly donut chart showing: '40% on Food, 25% on Rent, 15% on Transport'."),
        ("🎯 Monthly Budget Progress", "Visual progress bars that stay friendly green when safe, and turn amber if you're close to limit."),
        ("🌍 Works in Any Currency", "Formatted cleanly for Nigerian Naira (₦), US Dollars ($), Euros (€), and Pounds (£).")
    ]

    for i, (title, desc) in enumerate(features):
        x = 0.8 + ((i % 3) * 3.95)
        y = 1.75 + ((i // 3) * 2.6)
        c = s4.shapes.add_shape(MSO_SHAPE.ROUNDED_RECTANGLE, Inches(x), Inches(y), Inches(3.8), Inches(2.35))
        c.fill.solid()
        c.fill.fore_color.rgb = CARD_BG
        c.line.color.rgb = BORDER_COLOR
        tf = c.text_frame
        tf.word_wrap = True
        p = tf.paragraphs[0]
        p.text = title
        p.font.size = Pt(16)
        p.font.bold = True
        p.font.color.rgb = ACCENT_PURPLE
        p2 = tf.add_paragraph()
        p2.text = f"\n{desc}"
        p2.font.size = Pt(13)
        p2.font.color.rgb = TEXT_MUTED

    set_speaker_notes(s4, "Every single feature was designed for clarity. Even someone who hates numbers can look at the screen and understand their finances in 3 seconds.")

    # -------------------------------------------------------------
    # SLIDE 5: How It Works (Step-by-Step)
    # -------------------------------------------------------------
    s5 = add_base_slide("How It Works: As Easy as 1 — 2 — 3", "Simple Workflow")

    steps = [
        ("Step 1: Sign Up in 30 Seconds", "• Just your name, email, and password.\n• No credit card needed.\n• No linking your private bank accounts.\n• Instant Guest/Demo mode available to test right away!"),
        ("Step 2: Log What You Spend or Earn", "• Tap the big '+' button.\n• Type the amount (e.g. ₦3,500).\n• Select category: Food, Transport, Bills, or Salary.\n• Tap Save—takes less than 5 seconds!"),
        ("Step 3: Watch Your Savings Grow", "• See your daily balance update automatically.\n• Know exactly how much money you have left this month.\n• Reach your savings goals without stress.")
    ]

    for i, (title, details) in enumerate(steps):
        x = 0.8 + (i * 3.95)
        c = s5.shapes.add_shape(MSO_SHAPE.ROUNDED_RECTANGLE, Inches(x), Inches(1.8), Inches(3.8), Inches(4.8))
        c.fill.solid()
        c.fill.fore_color.rgb = CARD_BG
        c.line.color.rgb = ACCENT_GREEN
        c.line.width = Pt(1.5)
        tf = c.text_frame
        tf.word_wrap = True
        p = tf.paragraphs[0]
        p.text = title
        p.font.size = Pt(17)
        p.font.bold = True
        p.font.color.rgb = ACCENT_GREEN
        p2 = tf.add_paragraph()
        p2.text = f"\n{details}"
        p2.font.size = Pt(13)
        p2.font.color.rgb = TEXT_MAIN

    set_speaker_notes(s5, "There's no long onboarding tutorial. You sign up, log an expense, and immediately see your financial picture.")

    # -------------------------------------------------------------
    # SLIDE 6: Design & Colors (Visual Clarity)
    # -------------------------------------------------------------
    s6 = add_base_slide("Colors That Talk to You", "Look & Feel")

    color_cards = [
        ("🟢 Green Means Good / Inflow", "Whenever you receive money (Salary, Freelance, Gift) or your budget is on track, it's highlighted in a welcoming green."),
        ("🔴 Red Means Spending / Outflow", "Whenever you spend money, it displays with a minus sign in clear red, so you immediately see your cash outflow."),
        ("🟣 Purple Means Important Actions", "Buttons you need to tap—like 'Add Transaction' and 'Save'—use an energetic purple so you never get lost."),
        ("🌙 Dark & Light Themes Included", "Spendly defaults to a premium dark blue theme that's gentle on your eyes at night, with a clean bright mode for daylight.")
    ]

    for i, (title, desc) in enumerate(color_cards):
        y = 1.7 + (i * 1.32)
        c = s6.shapes.add_shape(MSO_SHAPE.ROUNDED_RECTANGLE, Inches(0.8), Inches(y), Inches(11.7), Inches(1.15))
        c.fill.solid()
        c.fill.fore_color.rgb = CARD_BG
        c.line.color.rgb = BORDER_COLOR
        tf = c.text_frame
        tf.word_wrap = True
        p = tf.paragraphs[0]
        p.text = title
        p.font.size = Pt(16)
        p.font.bold = True
        p.font.color.rgb = ACCENT_PURPLE
        p2 = tf.add_paragraph()
        p2.text = desc
        p2.font.size = Pt(13)
        p2.font.color.rgb = TEXT_MUTED

    set_speaker_notes(s6, "Every color has a clear meaning. Green is money coming in, red is money going out, and purple guides your thumb to the next step.")

    # -------------------------------------------------------------
    # SLIDE 7: Mobile & Computer Friendly
    # -------------------------------------------------------------
    s7 = add_base_slide("Feels Right on Every Screen", "Any Device")

    devices = [
        ("📱 On Your Smartphone", "• Fixed bottom bar with a big '+' button right by your thumb.\n• Big touch targets (no accidental tiny clicks).\n• Won't zoom in annoyingly when typing on iPhones.\n• Converts wide tables into beautiful, readable cards.", ACCENT_PURPLE),
        ("💻 On Your Laptop or Tablet", "• Expands into a spacious control center.\n• Side-by-side charts showing trends and category breakdowns.\n• Full transaction history table with 1-click CSV spreadsheet export.", ACCENT_GREEN)
    ]

    for i, (title, details, col) in enumerate(devices):
        x = 0.8 + (i * 5.95)
        c = s7.shapes.add_shape(MSO_SHAPE.ROUNDED_RECTANGLE, Inches(x), Inches(1.8), Inches(5.75), Inches(4.8))
        c.fill.solid()
        c.fill.fore_color.rgb = CARD_BG
        c.line.color.rgb = col
        c.line.width = Pt(1.5)
        tf = c.text_frame
        tf.word_wrap = True
        p = tf.paragraphs[0]
        p.text = title
        p.font.size = Pt(18)
        p.font.bold = True
        p.font.color.rgb = col
        p2 = tf.add_paragraph()
        p2.text = f"\n{details}"
        p2.font.size = Pt(14)
        p2.font.color.rgb = TEXT_MAIN

    set_speaker_notes(s7, "Whether you are checking your balance on the bus or reviewing monthly expenses at your desk, the app looks tailored specifically for that device.")

    # -------------------------------------------------------------
    # SLIDE 8: Safe, Private & Secure
    # -------------------------------------------------------------
    s8 = add_base_slide("Your Financial Data is 100% Yours", "Privacy & Safety")

    safety_points = [
        ("🔐 Zero Bank Account Access Needed", "Spendly tracks your manual inputs. We NEVER ask for your bank BVN, account numbers, ATM card PIN, or banking passwords."),
        ("🛡️ Locked Under Your Own Account", "Only you can see your transactions. Our security rules ensure no other user can view or alter your financial data."),
        ("🚫 No Annoying Ads or Data Selling", "Unlike free apps that sell your spending habits to advertisers, Spendly keeps your financial activity strictly private."),
        ("⚡ Works Even With Weak Internet", "Built with offline storage backup, so your logged payments are saved even when the network is unstable.")
    ]

    for i, (title, desc) in enumerate(safety_points):
        y = 1.7 + (i * 1.32)
        c = s8.shapes.add_shape(MSO_SHAPE.ROUNDED_RECTANGLE, Inches(0.8), Inches(y), Inches(11.7), Inches(1.15))
        c.fill.solid()
        c.fill.fore_color.rgb = CARD_BG
        c.line.color.rgb = BORDER_COLOR
        tf = c.text_frame
        tf.word_wrap = True
        p = tf.paragraphs[0]
        p.text = title
        p.font.size = Pt(16)
        p.font.bold = True
        p.font.color.rgb = ACCENT_GREEN
        p2 = tf.add_paragraph()
        p2.text = desc
        p2.font.size = Pt(13)
        p2.font.color.rgb = TEXT_MUTED

    set_speaker_notes(s8, "Privacy is the number one reason people abandon finance apps. Spendly eliminates that worry completely by not touching your bank logins.")

    # -------------------------------------------------------------
    # SLIDE 9: Why Spendly Beats Others
    # -------------------------------------------------------------
    s9 = add_base_slide("Why People Choose Spendly", "Comparison")

    comparisons = [
        ("Excel & Google Sheets", "❌ Painful on mobile\n❌ Formulas can break easily\n❌ Looks like office work\n❌ No friendly budget warnings"),
        ("Traditional Banking Apps", "❌ Confusing bank statements\n❌ Only shows one bank card\n❌ Can't track cash spending\n❌ No category customization"),
        ("Spendly", "✅ Gorgeous fintech look\n✅ Works on phone & laptop\n✅ Tracks cash, cards & transfers\n✅ Warns you before you run out of money\n✅ Fun and fast to use every day")
    ]

    for i, (title, text) in enumerate(comparisons):
        x = 0.8 + (i * 3.95)
        is_spendly = i == 2
        c = s9.shapes.add_shape(MSO_SHAPE.ROUNDED_RECTANGLE, Inches(x), Inches(1.8), Inches(3.8), Inches(4.8))
        c.fill.solid()
        c.fill.fore_color.rgb = CARD_BG
        c.line.color.rgb = ACCENT_GREEN if is_spendly else BORDER_COLOR
        c.line.width = Pt(2.0 if is_spendly else 1.0)
        tf = c.text_frame
        tf.word_wrap = True
        p = tf.paragraphs[0]
        p.text = title
        p.font.size = Pt(17)
        p.font.bold = True
        p.font.color.rgb = ACCENT_GREEN if is_spendly else ACCENT_RED
        p2 = tf.add_paragraph()
        p2.text = f"\n{text}"
        p2.font.size = Pt(13)
        p2.font.color.rgb = TEXT_MAIN

    set_speaker_notes(s9, "Spendly combines the simplicity of a quick note-taking app with the power of a modern fintech banking dashboard.")

    # -------------------------------------------------------------
    # SLIDE 10: Conclusion & Try It Live
    # -------------------------------------------------------------
    s10 = prs.slides.add_slide(blank_layout)
    bg10 = s10.shapes.add_shape(MSO_SHAPE.RECTANGLE, 0, 0, Inches(13.333), Inches(7.5))
    bg10.fill.solid()
    bg10.fill.fore_color.rgb = BG_DARK
    bg10.line.fill.background()

    card10 = s10.shapes.add_shape(MSO_SHAPE.ROUNDED_RECTANGLE, Inches(1.5), Inches(1.0), Inches(10.333), Inches(5.5))
    card10.fill.solid()
    card10.fill.fore_color.rgb = CARD_BG
    card10.line.color.rgb = ACCENT_PURPLE
    card10.line.width = Pt(2.0)

    tf10 = card10.text_frame
    tf10.word_wrap = True
    p10 = tf10.paragraphs[0]
    p10.text = "Take Control of Your Money Today"
    p10.alignment = PP_ALIGN.CENTER
    p10.font.size = Pt(38)
    p10.font.bold = True
    p10.font.color.rgb = TEXT_MAIN

    p10_sub = tf10.add_paragraph()
    p10_sub.text = "Try Spendly Live on Your Phone or Computer Right Now\n"
    p10_sub.alignment = PP_ALIGN.CENTER
    p10_sub.font.size = Pt(18)
    p10_sub.font.color.rgb = ACCENT_GREEN

    p10_links = tf10.add_paragraph()
    p10_links.text = "🌐 Open in Browser: https://spendly-nine-beta.vercel.app\n" \
                     "🤖 AI Copilot Included: Built-in voice & text financial advisor\n" \
                     "⚡ Instant Demo: Click 'Instant Guest / Demo Login' to test with 1 click!\n" \
                     "📱 Mobile Shell: Can also run as an app via Expo Go\n" \
                     "💻 Open Source: github.com/Daniel4456/spendly"
    p10_links.alignment = PP_ALIGN.CENTER
    p10_links.font.size = Pt(15)
    p10_links.font.color.rgb = TEXT_MUTED

    p10_q = tf10.add_paragraph()
    p10_q.text = "\nThank You! Questions & Live Demo"
    p10_q.alignment = PP_ALIGN.CENTER
    p10_q.font.size = Pt(22)
    p10_q.font.bold = True
    p10_q.font.color.rgb = ACCENT_PURPLE

    set_speaker_notes(s10, "Thank you everyone! I encourage you to open the link on your phone right now, click 'Instant Demo', and experience Spendly for yourself.")

    output_path = os.path.abspath("spendly_presentation.pptx")
    prs.save(output_path)
    print(f"Layman-friendly presentation saved at: {output_path}")

if __name__ == "__main__":
    create_layman_presentation()
