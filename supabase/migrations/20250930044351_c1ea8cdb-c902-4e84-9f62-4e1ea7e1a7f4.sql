-- Create profiles table
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  display_name TEXT,
  avatar_url TEXT,
  role TEXT DEFAULT 'user' CHECK (role IN ('user', 'admin')),
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

-- Create pages table for content sections
CREATE TABLE public.pages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug TEXT UNIQUE NOT NULL,
  title TEXT NOT NULL,
  subtitle TEXT,
  content_mdx TEXT NOT NULL DEFAULT '',
  order_num INTEGER NOT NULL,
  published BOOLEAN DEFAULT true NOT NULL,
  author_id UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

-- Create indexes
CREATE INDEX idx_pages_slug ON public.pages(slug);
CREATE INDEX idx_pages_published ON public.pages(published);
CREATE INDEX idx_pages_order ON public.pages(order_num);

-- Enable RLS
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.pages ENABLE ROW LEVEL SECURITY;

-- RLS policies for profiles
CREATE POLICY "Users can view their own profile"
  ON public.profiles FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile"
  ON public.profiles FOR UPDATE
  USING (auth.uid() = id);

CREATE POLICY "Admins can view all profiles"
  ON public.profiles FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid() AND role = 'admin'
  ));

-- RLS policies for pages
CREATE POLICY "Anyone can view published pages"
  ON public.pages FOR SELECT
  USING (published = true);

CREATE POLICY "Authors can view their own pages"
  ON public.pages FOR SELECT
  USING (auth.uid() = author_id);

CREATE POLICY "Admins can view all pages"
  ON public.pages FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid() AND role = 'admin'
  ));

CREATE POLICY "Authors can create pages"
  ON public.pages FOR INSERT
  WITH CHECK (auth.uid() = author_id);

CREATE POLICY "Authors can update their own pages"
  ON public.pages FOR UPDATE
  USING (auth.uid() = author_id);

CREATE POLICY "Admins can update all pages"
  ON public.pages FOR UPDATE
  USING (EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid() AND role = 'admin'
  ));

CREATE POLICY "Authors can delete their own pages"
  ON public.pages FOR DELETE
  USING (auth.uid() = author_id);

CREATE POLICY "Admins can delete all pages"
  ON public.pages FOR DELETE
  USING (EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid() AND role = 'admin'
  ));

-- Create trigger function for updated_at
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Add triggers
CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_pages_updated_at
  BEFORE UPDATE ON public.pages
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Create function to handle new user creation
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, display_name)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'display_name', split_part(NEW.email, '@', 1))
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to create profile on user signup
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- Seed initial pages
INSERT INTO public.pages (slug, title, subtitle, content_mdx, order_num, published) VALUES
('summary', 'Summary', 'Key findings and predictions', '# Summary

This research examines the trajectory of artificial intelligence development through 2027, analyzing compute trends, capability timelines, and potential risks.

## Key Predictions

- **Compute Growth**: Exponential increase in AI training compute
- **Timeline**: Critical developments expected within 2-3 years
- **Safety**: Emerging concerns require immediate attention', 1, true),

('research', 'Research', 'Our methodology and approach', '# Research Methodology

Our analysis combines:

- Large-scale compute forecasting
- Expert surveys and interviews
- Historical trend analysis
- Safety and security assessments

The research draws on public data, industry reports, and peer-reviewed literature to provide evidence-based predictions.', 2, true),

('compute', 'Compute Forecast', 'Training compute projections', '# Compute Forecast

## Historical Trends

AI training compute has doubled approximately every 6 months since 2012.

## Projections to 2027

- 2025: 10^27 FLOP training runs
- 2027: 10^28+ FLOP training runs
- Key constraint: chip production capacity

## Implications

Increased compute enables larger models with emergent capabilities.', 3, true),

('timelines', 'Timelines Forecast', 'When to expect key developments', '# AI Development Timelines

## Near Term (2024-2025)

- GPT-5 class models
- Multimodal integration
- Enhanced reasoning

## Medium Term (2025-2027)

- Human-level performance on many tasks
- Autonomous AI agents
- Scientific research acceleration', 4, true),

('takeoff', 'Takeoff Forecast', 'Speed of capability gain', '# AI Takeoff Dynamics

## Takeoff Speed

Current indicators suggest **fast takeoff** (months to 2 years from human-level to superintelligence).

## Key Factors

- Recursive self-improvement
- Hardware overhang
- Algorithmic insights
- Investment acceleration', 5, true),

('goals', 'AI Goals Forecast', 'Alignment and objective challenges', '# AI Goals and Alignment

## The Alignment Problem

Ensuring advanced AI systems pursue intended goals remains unsolved.

## Current Approaches

- Constitutional AI
- Reinforcement learning from human feedback (RLHF)
- Interpretability research
- Red teaming

## Challenges

Inner alignment, outer alignment, and deceptive alignment remain open problems.', 6, true),

('security', 'Security Forecast', 'Risks and mitigation strategies', '# AI Security Landscape

## Key Risks

- **Misuse**: Biological weapons, cyber attacks
- **Accidents**: Unintended consequences of capable systems
- **Loss of control**: Systems that can''t be shut down

## Mitigation Strategies

1. Compute governance
2. International cooperation
3. Safety research funding
4. Responsible disclosure norms

## Timeline

Critical period: 2025-2027 when systems reach dangerous capability thresholds.', 7, true);