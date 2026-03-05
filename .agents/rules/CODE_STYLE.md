# Angular Project Code Style

## Principles
- **Signals**: Use signals for local state management.
- **OnPush**: Set `changeDetection: ChangeDetectionStrategy.OnPush` for all components.
- **Functional Components**: Use `input()` and `output()` functions.
- **Functional Guards/Interceptors**: Prefer them over class-based ones.

## Structure
- Use `@domains` alias for domain-specific components/services.
- Use `@core` for singleton services and utilities.
- Components should be standalone by default.

## Styling
- Use Vanilla CSS or TailwindCSS as requested.
- Prioritize premium aesthetics and animations.
