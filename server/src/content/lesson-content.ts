export interface LessonContent {
  videoId: string;
  channel: string;
  content: string;
  keyPoints: string[];
}

// TODO: add real video. Keep both values empty until a verified lecture is supplied.
function lesson(content: string[], keyPoints: string[]): LessonContent {
  return {
    videoId: "",
    channel: "",
    content: content.join("\n\n"),
    keyPoints,
  };
}

export function lessonContentKey(courseSlug: string, title: string) {
  return `${courseSlug}::${title}`;
}

export const lessonContent: Record<string, LessonContent> = {
  "html-fundamentals::Introduction to HTML": lesson(
    [
      "HTML, or HyperText Markup Language, gives a browser the structure and meaning of a web page. It describes headings, paragraphs, links, lists, and forms; CSS controls appearance, while JavaScript adds behavior. A browser reads the document and builds a tree of elements called the DOM. Most elements use an opening tag, content, and a closing tag, although some, such as `img`, are void elements.",
      "A page begins with a doctype declaration so the browser uses modern standards. The `html` element wraps the document, `head` stores information such as its title and character encoding, and `body` contains visible page content. The `lang` attribute communicates the primary language to assistive technology. Use elements for their meaning rather than choosing tags only for their default appearance.",
      "A good first document is short, but it already benefits from a clear heading and a descriptive paragraph. Save it as an `.html` file and open it in a browser to see the rendered result. When content changes, edit the source and reload the page. This separation between source markup and rendered output is the foundation for understanding every later HTML lesson.",
      '```html\n<!doctype html>\n<html lang="en">\n  <head><meta charset="utf-8"><title>First page</title></head>\n  <body><h1>Hello, web</h1><p>This is my page.</p></body>\n</html>\n```',
    ],
    [
      "HTML describes page structure and meaning.",
      "The head contains metadata; the body contains visible content.",
      "Use semantic elements instead of styling with tags.",
      "A doctype enables modern browser standards mode.",
    ]
  ),
  "html-fundamentals::HTML Elements and Tags": lesson(
    [
      "An HTML element is the complete unit formed by its tags, content, and attributes. For example, `<p>Welcome</p>` is a paragraph element: the first tag opens it, the text is its content, and the final tag closes it. Tags written inside another element create nesting. Indentation does not change browser behavior, but consistent indentation makes nested relationships easier for people to inspect.",
      "Some elements can contain other elements, while others are void and cannot contain children. An image is written with one `img` tag, not a separate closing tag. Elements also have specific content rules; a paragraph should not contain another paragraph. Browsers may repair invalid markup, but relying on automatic repair can produce confusing layouts and accessibility problems.",
      "Choose elements according to the role of their content. Use headings for section titles, paragraphs for prose, lists for grouped items, and buttons for actions. A `div` is a generic grouping element and is useful when no more meaningful element fits. Semantic choices help keyboard users and assistive technology navigate, and they make the intent of the document clearer to future developers.",
      "```html\n<section>\n  <h2>Getting started</h2>\n  <p>Read the guide before you begin.</p>\n</section>\n```",
    ],
    [
      "An element includes tags, content, and attributes.",
      "Nest elements according to their content rules.",
      "Void elements such as `img` do not have closing tags.",
      "Choose tags for meaning, not their default styling.",
    ]
  ),
  "html-fundamentals::HTML Attributes": lesson(
    [
      "Attributes provide extra information or behavior for an HTML element. They appear in the opening tag as a name and value, usually with the value in quotation marks. For example, the `href` attribute gives a link its destination, and `src` identifies an image file. Many attributes are specific to certain elements, so check that an attribute is meaningful where it is used.",
      'Some attributes are global and work on many elements. `id` identifies one element in a document and should be unique; `class` groups elements for CSS or scripts. The `lang` attribute identifies language, and `title` can supply supplementary information. Boolean attributes, such as `disabled`, are true when present and false when omitted; writing `disabled="false"` still means disabled.',
      "Use attributes to express real information rather than as a substitute for visible labels. An image should have useful alternative text when it communicates content, and form controls should have associated labels. Keep values correctly quoted, choose descriptive names, and avoid reusing an `id`. These habits improve readability and reduce bugs when CSS, JavaScript, or assistive technology relies on the markup.",
      '```html\n<a href="/courses" class="primary-link" id="course-link">\n  Browse courses\n</a>\n```',
    ],
    [
      "Attributes add information to an element's opening tag.",
      "`href` and `src` provide link and media locations.",
      "An `id` should be unique; a class can be reused.",
      "Boolean attributes are enabled by being present.",
    ]
  ),
  "html-fundamentals::HTML Forms and Input Elements": lesson(
    [
      "HTML forms collect information from a person and send it for processing. A `form` groups controls and can declare where data is sent with `action` and how it is sent with `method`. Each control should have a visible `label` connected through matching `for` and `id` values. Labels make controls easier to understand and enlarge the clickable area on many devices.",
      "Choose an input type that matches the data, such as `email`, `number`, or `password`; the browser can then offer suitable keyboards and basic validation. A control's `name` becomes its key in submitted form data, while `value` represents its current value. The `required` attribute marks a field that must be completed. Client-side checks help people, but a server must validate submitted values too.",
      'A button inside a form submits by default unless its type says otherwise. Use `type="submit"` for the intended action and `type="button"` for a control that should not submit. Group related controls with `fieldset` and `legend` when that improves clarity. Good forms explain what is needed, show errors accessibly, and never rely on placeholder text as the only label.',
      '```html\n<form action="/signup" method="post">\n  <label for="email">Email</label>\n  <input id="email" name="email" type="email" required>\n  <button type="submit">Join</button>\n</form>\n```',
    ],
    [
      "Associate each control with a visible label.",
      "Use input types and names that match the data.",
      "Browser validation improves usability; servers must validate too.",
      "Set button types deliberately inside forms.",
    ]
  ),
  "html-fundamentals::HTML Tables and Semantic Elements": lesson(
    [
      "Use an HTML table for data whose meaning depends on relationships between rows and columns, such as a schedule or comparison. A table is not a layout tool. The `tr` element creates a row, `th` marks a header cell, and `td` holds ordinary data. A `caption` briefly describes the table, and `thead`, `tbody`, and `tfoot` can group rows by purpose.",
      "Header cells should communicate which data they label. The `scope` attribute can identify a header for a row or column, helping assistive technology connect values with their headings. Keep tables understandable on narrow screens, and avoid very complex structures when a simpler list or set of cards explains the information better.",
      "Semantic elements describe the role of page regions. Use `header` and `footer` for introductory and closing content, `nav` for major navigation, `main` for the page's unique primary content, and `article` for a self-contained item. A `section` groups a themed part of a page, generally with a heading. These elements do not automatically style a page; their benefit is clear structure for users and tools.",
      '```html\n<table>\n  <caption>Weekly study hours</caption>\n  <tr><th scope="col">Day</th><th scope="col">Hours</th></tr>\n  <tr><th scope="row">Monday</th><td>1</td></tr>\n</table>\n```',
    ],
    [
      "Reserve tables for tabular data, not page layout.",
      "Use `th`, captions, and scope to explain table relationships.",
      "Semantic landmarks describe the roles of page regions.",
      "Give sections headings that make their subject clear.",
    ]
  ),
  "css-fundamentals::Introduction to CSS": lesson(
    [
      "CSS, or Cascading Style Sheets, controls how HTML content looks and is arranged. A rule contains a selector and declarations: the selector chooses elements, and each declaration pairs a property with a value. For example, a rule can select every paragraph and set its text color. Keeping styles in a separate stylesheet lets one set of rules apply consistently across many pages.",
      "The cascade is the browser's process for deciding which declarations apply when several rules match. Origin, importance, specificity, and source order all matter; a later rule only wins when the earlier factors do not decide the result. Inheritance also lets some values, such as font color, pass from a parent to its children. Understanding these ideas helps avoid random overrides.",
      "A stylesheet can be linked from a document's head with a `link` element. Start with readable selectors and a small set of rules, then inspect the result in browser developer tools. Prefer styling classes that describe a component or role rather than deeply chained selectors. This keeps styles easier to change as the page grows.",
      "```css\n.notice {\n  color: #334155;\n  background-color: #f1f5f9;\n  padding: 1rem;\n}\n```",
    ],
    [
      "A CSS rule combines a selector with declarations.",
      "The cascade resolves competing declarations by defined priorities.",
      "Some properties inherit from parent elements.",
      "Link stylesheets from the document head.",
    ]
  ),
  "css-fundamentals::CSS Selectors": lesson(
    [
      "A CSS selector describes which elements a rule should match. A type selector such as `p` matches every paragraph, while a class selector such as `.card` matches elements carrying that class. An ID selector targets an element by its unique `id`, but reusable classes are usually easier to maintain. Selectors can be grouped with commas when the same declarations apply to several targets.",
      "Combinators express relationships. A space selects a descendant at any depth, `>` selects a direct child, and `+` selects the immediately following sibling. Attribute selectors can match elements based on a value, such as inputs with a particular type. Pseudo-classes like `:hover` or `:focus-visible` describe a state, while pseudo-elements such as `::before` target a generated part.",
      "Specificity affects how competing declarations are prioritized, so selectors should remain as simple as possible. Combining several IDs, classes, and element names creates rules that are difficult to override. Prefer one component class and add a state class when necessary. Test selectors against real markup and make sure interactive states remain visible for keyboard users, not only when a pointer hovers.",
      "```css\n.card { padding: 1rem; }\n.card > h2 { margin-top: 0; }\nbutton:focus-visible { outline: 3px solid royalblue; }\n```",
    ],
    [
      "Classes are reusable selectors for component styling.",
      "Combinators select descendants, children, and siblings.",
      "Pseudo-classes match element states.",
      "Simple selectors keep specificity manageable.",
    ]
  ),
  "css-fundamentals::Colors and Backgrounds": lesson(
    [
      "CSS color properties affect text, borders, and surfaces. A color can be written as a named color, hexadecimal value, RGB or HSL function, or a supported modern color notation. Hex values are compact, while HSL expresses hue, saturation, and lightness in a way that can be easier to adjust. Choose a format your team can read and use consistently.",
      "The `color` property sets text foreground; `background-color` sets an element's surface. Background images can add decoration, but important information should not exist only in an image because users may not perceive it and it can be slow to load. Set a fallback background color when using an image. Transparency can be useful, but ensure text remains readable over the combined background.",
      "Contrast is the difference between foreground and background colors. Sufficient contrast supports people with low vision and helps text remain legible on different screens. Use a contrast checker for normal text and interactive controls, and do not rely on color alone to communicate status. Add labels, icons, or shape changes as another cue, and test both light and dark states.",
      "```css\n.status {\n  color: #14532d;\n  background-color: #dcfce7;\n  border: 1px solid #86efac;\n}\n```",
    ],
    [
      "CSS supports named, hexadecimal, RGB, and HSL colors.",
      "`color` styles text; `background-color` styles a surface.",
      "Check text contrast against its actual background.",
      "Do not use color as the only signal for meaning.",
    ]
  ),
  "css-fundamentals::Flexbox and Grid": lesson(
    [
      "Flexbox and Grid are CSS layout systems, but they solve different kinds of problems. Flexbox arranges items along one main axis, either as a row or column, and can distribute leftover space. It is useful for navigation bars, button groups, and aligning items within a component. The cross axis is perpendicular to the main axis, so direction changes which alignment property affects which dimension.",
      "Grid defines rows and columns together, making it a two-dimensional layout system. A grid container can allocate tracks with fixed, flexible, or content-based sizes. The `fr` unit divides available space, while `repeat()` and `minmax()` help describe layouts that adapt to their content. Grid is useful for page regions, galleries, and aligned card collections.",
      "Start with the relationship between the items, not with a preferred technology. Use Flexbox when a single row or column is the main concern; use Grid when rows and columns need coordinated sizing. They can also be combined, with Grid arranging page sections and Flexbox aligning content inside each section. Add gaps directly to the container instead of creating spacing through child margins.",
      "```css\n.cards {\n  display: grid;\n  grid-template-columns: repeat(auto-fit, minmax(14rem, 1fr));\n  gap: 1rem;\n}\n```",
    ],
    [
      "Flexbox primarily arranges content along one axis.",
      "Grid coordinates both rows and columns.",
      "Choose a layout system based on the item relationships.",
      "Use `gap` to create consistent space between items.",
    ]
  ),
  "css-fundamentals::Responsive Web Design": lesson(
    [
      "Responsive web design makes a page usable across a range of screen sizes and input methods. Start with flexible widths, readable text, and content that can wrap naturally instead of assuming a particular device. The viewport meta element tells mobile browsers to use the device width for layout. Without it, a narrow screen may render a scaled desktop-sized page.",
      "Media queries apply styles when conditions are met, commonly when the viewport crosses a width breakpoint. Choose breakpoints where the content needs more room rather than copying a list of device sizes. A mobile-first stylesheet begins with the narrow layout and adds enhancements for wider screens. This keeps the core experience simple and prevents small-screen rules from being an afterthought.",
      "Responsive layouts also account for images and text. Images can use `max-width: 100%` to stay within their container, while grid and flex layouts can wrap or create additional columns. Test with browser resizing and real content, including long labels and large text. A design is not responsive if it technically fits but makes controls hard to use or content hard to read.",
      "```css\nimg { max-width: 100%; height: auto; }\n.layout { display: grid; grid-template-columns: 1fr; gap: 1rem; }\n@media (min-width: 48rem) { .layout { grid-template-columns: 1fr 1fr; } }\n```",
    ],
    [
      "Use the viewport meta element for mobile layout sizing.",
      "Let content needs determine responsive breakpoints.",
      "Build a simple narrow layout before wider enhancements.",
      "Test with real text, zoom, and varied viewport sizes.",
    ]
  ),
  "javascript::Introduction to JavaScript": lesson(
    [
      "JavaScript is a programming language used in browsers and many other environments. In a web page, it can respond to user actions, update the DOM, validate input, and communicate with a server. It is different from Java despite the similar names. A browser executes JavaScript after loading a script, and the language supports values, expressions, functions, objects, and asynchronous work.",
      "A script can be included with a `script` element. Using an external file with `defer` lets the browser download it while parsing HTML and wait to run it until the document has been parsed. This avoids many timing problems when a script needs to find page elements. During early practice, use the browser console to inspect values and read errors.",
      "JavaScript is case-sensitive, so `userName` and `username` are different identifiers. Statements can be grouped into functions, and expressions produce values that can be stored or passed elsewhere. Begin with a small task: define a value, transform it, and display a result. Clear names and short functions make behavior easier to trace as a project becomes more interactive.",
      '```js\nconst learner = "Ari";\nconst message = `Welcome, ${learner}!`;\nconsole.log(message);\n```',
    ],
    [
      "JavaScript adds behavior and interactivity to web pages.",
      "The language is case-sensitive and distinct from Java.",
      "Use `defer` when a script needs parsed page markup.",
      "The browser console helps inspect results and errors.",
    ]
  ),
  "javascript::Variables and Data Types": lesson(
    [
      "A variable gives a name to a value so a program can use it later. Use `const` when the binding will not be reassigned, and `let` when it needs a new value. Both are block-scoped. The older `var` has different scoping behavior and is usually avoided in modern code. A `const` object can still have its properties changed; the binding itself simply cannot point to a different object.",
      "JavaScript has primitive values such as strings, numbers, booleans, `null`, `undefined`, bigints, and symbols. Objects and arrays are reference values that can group related data. Use descriptive variable names and choose the value that best expresses the task. Avoid relying on implicit type conversions, because expressions like adding a number and a string can produce surprising results.",
      "Strict equality with `===` compares values without converting their types first. Check types when data comes from a form, network response, or other external source. A form field often starts as a string even when it visually contains a number, so convert and validate it deliberately. Small explicit conversions make assumptions visible and make errors easier to debug.",
      '```js\nconst course = "HTML";\nlet completedLessons = 0;\ncompletedLessons = Number("2");\nconsole.log(course, completedLessons === 2);\n```',
    ],
    [
      "Use `const` by default and `let` for reassigned bindings.",
      "Primitive values differ from objects and arrays.",
      "Strict equality avoids implicit type conversion.",
      "Validate and convert values from external input.",
    ]
  ),
  "javascript::Functions and Scope": lesson(
    [
      "A function packages behavior so it can be called from different places. It may receive parameters, perform work, and return a value. A function declaration is available throughout its containing scope due to hoisting, while function expressions and arrow functions are commonly assigned to variables. Use names that describe the result or action, and keep each function focused on one understandable task.",
      "Scope determines where a variable can be accessed. `let` and `const` are block-scoped, so a variable created inside braces is not available outside those braces. Functions create their own scope and can read variables from surrounding lexical scopes. A closure occurs when a function retains access to that surrounding environment, even after the outer function has finished.",
      "Closures are useful for callbacks and for keeping state private, but captured values can also remain in memory as long as a closure is reachable. Pass necessary values explicitly when that makes a function easier to test. Prefer pure functions for calculations: the same inputs produce the same result without changing outside state. This makes behavior easier to reuse and reason about.",
      "```js\nfunction makeCounter() {\n  let count = 0;\n  return () => ++count;\n}\nconst next = makeCounter();\n```",
    ],
    [
      "Functions can accept parameters and return results.",
      "Block scope limits where `let` and `const` are visible.",
      "Closures retain access to their lexical environment.",
      "Small pure functions are easier to test and reuse.",
    ]
  ),
  "javascript::DOM Manipulation": lesson(
    [
      "The Document Object Model represents an HTML document as objects that JavaScript can inspect and change. Use methods such as `querySelector` to find an element and properties such as `textContent` to update its text. A selector may return `null` when nothing matches, so check the result before using it. This is especially important when scripts run on several pages with different markup.",
      "For user-provided text, `textContent` treats the value as text instead of parsing it as HTML. Avoid assigning untrusted strings to `innerHTML`, because inserted markup can create cross-site scripting vulnerabilities. To add repeated items, create elements with DOM methods, set safe properties, and append them to a container. Keep markup changes small and let CSS handle presentation.",
      "Changing the DOM directly is appropriate for browser scripts, but large updates can become difficult to coordinate. Separate data handling from rendering and update only the elements that need to change. Load scripts after the document is parsed or wait for the appropriate lifecycle event. Browser developer tools let you inspect both the current DOM and errors that interrupt execution.",
      '```js\nconst heading = document.querySelector("h1");\nif (heading) heading.textContent = "Welcome back";\n```',
    ],
    [
      "The DOM exposes document elements to JavaScript.",
      "Check selector results because an element may be absent.",
      "`textContent` safely inserts text without parsing HTML.",
      "Avoid putting untrusted values into `innerHTML`.",
    ]
  ),
  "javascript::Events and Event Handling": lesson(
    [
      "An event represents something that happened in the browser, such as a click, key press, form submission, or page load. JavaScript can register a listener with `addEventListener`. The browser calls the listener when that event occurs and passes an event object containing details. Keep listeners close to the code that owns the interaction, and use function references that can be removed when no longer needed.",
      "Some events bubble from a target through its ancestors. Event delegation uses this behavior by placing one listener on a parent and checking which child initiated the event. This can simplify lists whose items are added or removed later. The event's `target` is where it originated; `currentTarget` is the element whose listener is running.",
      "For form submission, call `preventDefault()` only when JavaScript will provide the intended alternative behavior. Do not block keyboard defaults without a strong reason. Buttons and links already support keyboard activation, so prefer them over clickable generic containers. Event handlers should handle missing or invalid data, give clear feedback, and avoid doing lengthy synchronous work that could freeze the page.",
      '```js\nconst form = document.querySelector("form");\nform?.addEventListener("submit", (event) => {\n  event.preventDefault();\n});\n```',
    ],
    [
      "Listeners respond to browser events with `addEventListener`.",
      "Bubbling enables event delegation on a parent.",
      "Use semantic buttons and links for keyboard support.",
      "Prevent default behavior only when replacing it deliberately.",
    ]
  ),
  "react-development::Introduction to React": lesson(
    [
      "React is a JavaScript library for building user interfaces from reusable pieces. A React application is usually described as a tree of components. Each component receives inputs, returns a description of what should appear, and can be composed with other components. React updates the rendered interface when data changes, so developers describe the desired result instead of manually editing every DOM node.",
      "JSX is a syntax extension commonly used to write markup-like expressions inside JavaScript. It is transformed by a build tool before the browser runs the resulting JavaScript. JSX expressions use braces to include JavaScript values, and elements need to follow JSX rules such as one returned root or a fragment. It is not HTML copied verbatim; for example, many attributes use JavaScript naming conventions.",
      "A component should have a clear responsibility and render based on its inputs. Start with a static view, then add state and events when interaction is needed. React does not replace HTML, CSS, or JavaScript; it organizes them into an application model. Browser developer tools and React DevTools can help inspect the component tree and props.",
      "```jsx\nfunction Welcome() {\n  return <h1>Welcome to LearnAI</h1>;\n}\n```",
    ],
    [
      "React builds interfaces from reusable components.",
      "Components describe UI from inputs and current state.",
      "JSX is transformed by the project's build process.",
      "React complements rather than replaces web fundamentals.",
    ]
  ),
  "react-development::Components and JSX": lesson(
    [
      "A React component is a function or class that represents part of an interface; modern React code commonly uses function components. Component names begin with a capital letter so JSX treats them as custom components rather than built-in HTML tags. A component returns JSX describing its output, and a parent can compose several smaller components into a page.",
      "JSX looks like markup but follows JavaScript expression rules. Use braces to include values or expressions, and use `className` for CSS classes. A component must return one enclosing element, which can be a fragment when no extra DOM wrapper is needed. List items should have stable keys so React can match them when the collection changes.",
      "Keep components focused and extract repeated or independently meaningful UI. Avoid placing complex calculations directly inside JSX when a named variable or helper makes the result easier to understand. Components should not mutate props or shared data while rendering. Rendering should be predictable: the same inputs should describe the same interface.",
      '```jsx\nfunction CourseTitle({ title }) {\n  return <h2 className="course-title">{title}</h2>;\n}\n```',
    ],
    [
      "Function component names begin with a capital letter.",
      "JSX embeds expressions with braces and uses `className`.",
      "Use stable keys for rendered collections.",
      "Keep rendering predictable and avoid mutating props.",
    ]
  ),
  "react-development::Props and State": lesson(
    [
      "Props are values a parent passes to a child component. They make components reusable because the same component can display different data. A child should treat props as read-only and ask its parent to perform changes through callbacks when needed. Destructure props to make the inputs used by the component clear.",
      "State represents data that can change over time and affect what the component renders. The `useState` Hook returns the current value and a setter. Calling the setter schedules a render with the new state; it does not change the current variable immediately. When the next value depends on the previous value, use the functional setter form to avoid stale updates.",
      "Do not mutate objects or arrays held in state. Create a new value with spread syntax or array methods that return a new array, then pass that value to the setter. Keep state as close as practical to the components that need it. If several siblings share a value, lift that state to their nearest common parent and pass data or callbacks down.",
      "```jsx\nconst [count, setCount] = useState(0);\nsetCount((previous) => previous + 1);\n```",
    ],
    [
      "Props pass read-only values from parent to child.",
      "State changes schedule a render with updated data.",
      "Use functional updates when the next value depends on the previous one.",
      "Create new arrays or objects instead of mutating state.",
    ]
  ),
  "react-development::React Hooks": lesson(
    [
      "Hooks let function components use React features such as state, context, and effects. A Hook name begins with `use`, for example `useState` or `useEffect`. Call Hooks at the top level of a component or custom Hook, not inside conditions, loops, or nested functions. This stable call order lets React associate each Hook with the correct component state between renders.",
      "`useEffect` synchronizes a component with an external system after rendering, such as a browser event listener or a network connection. Its dependency list tells React when to rerun the effect; every reactive value used by the effect should be accounted for. A cleanup function can remove a listener or release a resource before the effect runs again or the component unmounts.",
      "Effects are not needed for every calculation or event. Derive values during rendering when they can be computed from props and state, and handle user actions in event handlers. Custom Hooks can share stateful logic between components. Choose Hooks to make behavior clear, and follow the lint rules that detect invalid calls and missing dependencies.",
      "```jsx\nuseEffect(() => {\n  document.title = `Count: ${count}`;\n}, [count]);\n```",
    ],
    [
      "Call Hooks at the top level of React components or Hooks.",
      "Effects synchronize with external systems.",
      "Include reactive dependencies and clean up resources.",
      "Derive render values directly when no effect is needed.",
    ]
  ),
  "react-development::React Router": lesson(
    [
      "React Router maps browser URLs to UI without requiring a full page reload for every navigation. A route associates a path with an element, and nested routes can share layouts while rendering child pages. A router provider listens for navigation changes and supplies routing context to components. Use links for navigation so browser history, keyboard behavior, and open-in-new-tab actions continue to work.",
      "Dynamic path segments can represent identifiers such as a course slug. Route components can read those parameters and load the matching data. Search parameters are useful for optional filters or view state that should be shareable in a URL. Check missing or invalid values and show a useful not-found state instead of rendering unrelated content.",
      "Navigation can be triggered from code for actions such as redirecting after a successful form submission, but ordinary navigation should use links. Route loaders or query hooks can manage data fetching according to the project's patterns. Keep route definitions organized, protect restricted pages with the application's authorization flow, and ensure the server can return the app entry point for client-side routes.",
      '```jsx\n<Route path="/courses/:slug" element={<CoursePage />} />\n```',
    ],
    [
      "Routes connect URL paths to interface elements.",
      "Use links for normal navigation and preserve browser behavior.",
      "Validate dynamic route values and handle missing pages.",
      "Protect restricted routes with application authorization.",
    ]
  ),
  "typescript-essentials::Why TypeScript": lesson(
    [
      "TypeScript adds a static type system to JavaScript. You write familiar JavaScript code with extra annotations or type definitions, then the TypeScript compiler checks many mistakes before the program runs. Browsers do not execute TypeScript directly, so a build tool removes type syntax and emits JavaScript. Types do not change JavaScript's runtime behavior or validate data that arrives from a network.",
      "A type checker can catch misspelled properties, incompatible function arguments, and missing return values while you work. This is especially helpful as a project grows or several people share code. TypeScript can also infer types from values, so explicit annotations are most useful at boundaries or where they clarify intent. Adding types does not guarantee a bug-free program; tests and careful design remain important.",
      "A project usually has a TypeScript configuration describing its source files and compiler options. Strict settings encourage explicit handling of missing and unknown values. Existing JavaScript can adopt TypeScript gradually, while new files gain checks immediately. Start by typing function inputs and outputs, then model the shape of the data passed between components or services.",
      "```ts\nfunction greet(name: string): string {\n  return `Hello, ${name}`;\n}\n```",
    ],
    [
      "TypeScript checks code before JavaScript runs.",
      "A build step removes type annotations for the runtime.",
      "Types help catch mistakes but do not replace tests.",
      "Strict checks make uncertain values explicit.",
    ]
  ),
  "typescript-essentials::Primitive and Union Types": lesson(
    [
      "Primitive types describe simple values. TypeScript uses `string`, `number`, `boolean`, `null`, `undefined`, `bigint`, and `symbol`. An annotation follows a variable name with a colon, but the compiler often infers the type from its initial value. Prefer inference for obvious local values and annotations when they document a function boundary or prevent an overly broad type.",
      "A union type allows a value to belong to one of several types. For example, a status might be a string from a small set of literals, or a value may be a number or `null`. Code must account for every possibility before using an operation that works only for one member. TypeScript's control-flow analysis narrows the possible type after checks such as `typeof`, equality comparisons, or a null guard.",
      "Avoid using `any` to silence errors because it disables checking for that value. Use `unknown` when a value can be anything, then validate or narrow it before use. This is a useful pattern for parsed JSON and other external input. Literal unions are often clearer than unrestricted strings for known states, while optional properties should be checked before being read.",
      '```ts\nfunction label(value: string | number): string {\n  return typeof value === "number" ? value.toFixed(0) : value;\n}\n```',
    ],
    [
      "Primitive annotations describe simple values.",
      "Union values need checks before member-specific operations.",
      "Prefer `unknown` to unchecked `any` at uncertain boundaries.",
      "TypeScript narrows types after reliable runtime checks.",
    ]
  ),
  "typescript-essentials::Objects and Interfaces": lesson(
    [
      "Object types describe the properties that a value must or may contain. An interface gives a named shape that can be reused across functions and modules. A property followed by a question mark is optional, meaning code must handle the case where it is absent. `readonly` prevents reassignment through a particular typed reference, though it does not deeply freeze an object at runtime.",
      "TypeScript uses structural typing: an object is compatible when it has the required members with suitable types. This makes interfaces useful for describing data from an API without requiring a class hierarchy. Interfaces can be extended to compose related shapes, while type aliases can also represent object shapes and are necessary for unions and other type expressions.",
      "Keep data models focused on fields a consumer actually uses. A server response may contain more properties than a client needs, and a type should not claim a value is present unless the application guarantees it. Types are erased during compilation, so they cannot check a JSON response by themselves. Validate untrusted data at runtime, then convert it to a trusted application type.",
      "```ts\ninterface Course {\n  title: string;\n  description?: string;\n  readonly slug: string;\n}\n```",
    ],
    [
      "Interfaces give reusable names to object shapes.",
      "Optional fields may be absent and require a check.",
      "Structural typing checks members rather than class identity.",
      "Types vanish at runtime, so external data needs validation.",
    ]
  ),
  "typescript-essentials::Typed Functions": lesson(
    [
      "Function types describe the values a function accepts and returns. Parameter annotations belong after each parameter name, and a return type follows the closing parenthesis. TypeScript can infer a return type, but an explicit return annotation can make a public function contract easier to review. A function without a meaningful result should return `void`, not an invented placeholder value.",
      "Optional parameters use a question mark and must come after required parameters. Default values also make a parameter optional at the call site. A callback can be typed with a function signature so its expected arguments and result are clear. When a function can fail or return several shapes, model those outcomes explicitly instead of hiding them in `any`.",
      "A function should accept the narrowest inputs it can genuinely support and return a clear result. If it receives a union, narrow it before using type-specific methods. Generic functions can preserve relationships between input and output types, while overloads describe a small set of distinct call patterns. Use these features only when they make callers safer and clearer.",
      "```ts\nfunction total(values: number[], start = 0): number {\n  return values.reduce((sum, value) => sum + value, start);\n}\n```",
    ],
    [
      "Function signatures describe parameters and return values.",
      "Default-valued parameters can be omitted by callers.",
      "Model failure and alternate results explicitly.",
      "Use narrow input types that match supported behavior.",
    ]
  ),
  "typescript-essentials::Generics and Narrowing": lesson(
    [
      "A generic lets a function or type work with different value types while preserving useful relationships between them. A type parameter is introduced in angle brackets and can be constrained when an operation requires certain properties. For example, a generic identity function returns the same type it receives instead of widening every result to `unknown` or `any`.",
      "Narrowing reduces a union to a more specific type using runtime evidence. Checks such as `typeof`, the `in` operator, equality comparisons, and `instanceof` can narrow values. Discriminated unions use a shared literal property, often called a tag, to identify each variant. A switch on that property can make all cases explicit and support exhaustive checking.",
      "Generics are valuable when a function truly preserves a type relationship, such as a collection returning its item type. Avoid adding type parameters that do not affect the result, since they make APIs harder to understand. Use narrowing where the program observes actual data; a type assertion only tells the compiler to trust you and does not perform a check.",
      "```ts\nfunction first<T>(items: T[]): T | undefined {\n  return items[0];\n}\n```",
    ],
    [
      "Generics preserve relationships between input and output types.",
      "Runtime checks narrow union values safely.",
      "Discriminated unions make variant handling explicit.",
      "Assertions do not validate or transform runtime data.",
    ]
  ),
  "node-express-apis::Node.js Runtime": lesson(
    [
      "Node.js is a JavaScript runtime that executes code outside the browser. It provides APIs for tasks such as reading files, opening network connections, and working with processes. Node is commonly used for web servers and command-line tools. Its JavaScript execution is event-driven, and many I/O operations are asynchronous so the process can handle other work while waiting for the operating system.",
      "A Node program starts from an entry file and loads dependencies through modules. Modern projects may use ECMAScript modules with `import` and `export`, or CommonJS with `require` and `module.exports`; a project should follow one clear configuration. `package.json` records scripts, dependencies, and module settings. Lockfiles preserve resolved dependency versions for repeatable installs.",
      "Asynchronous code often uses promises and `async`/`await`. Awaiting file or network I/O does not block the JavaScript thread in the same way as a long synchronous loop. Errors from asynchronous work should be handled deliberately and surfaced to the caller. Keep secrets in server-side environment configuration, not in source files or browser bundles.",
      '```js\nimport { readFile } from "node:fs/promises";\nconst text = await readFile("notes.txt", "utf8");\nconsole.log(text.length);\n```',
    ],
    [
      "Node.js runs JavaScript in a server-side environment.",
      "Modules and package metadata define code and dependencies.",
      "Promises support non-blocking asynchronous I/O.",
      "Keep credentials in server-side environment configuration.",
    ]
  ),
  "node-express-apis::Express Routes": lesson(
    [
      "Express is a web framework for Node.js that helps map HTTP requests to application behavior. A route combines an HTTP method and a path, such as `GET /courses`, with a handler. The handler receives a request and response and can return JSON, a status code, or another response. Use routes to translate an HTTP request into a clear application operation.",
      "Route parameters capture parts of a path, query parameters express filters, and a request body carries submitted data. These sources are all input and should be validated before the application trusts them. A `GET` route should generally read data without changing it; `POST`, `PATCH`, and `DELETE` communicate other intent. Use status codes that distinguish successful creation, validation failure, missing data, and server errors.",
      "A route should stay understandable as it grows. Middleware can handle shared work such as authentication and request validation, while service functions hold reusable business logic. Async handlers need a consistent error path so rejected operations do not leave requests hanging. Return only the fields the client needs, and do not send private database data just because it is available on a document.",
      '```js\napp.get("/courses/:slug", async (req, res) => {\n  res.json({ slug: req.params.slug });\n});\n```',
    ],
    [
      "Routes pair an HTTP method and path with a handler.",
      "Validate path, query, and body input before use.",
      "Use methods and status codes according to request intent.",
      "Return only the data the client needs.",
    ]
  ),
  "node-express-apis::Request and Response": lesson(
    [
      "An HTTP request contains a method, URL, headers, and sometimes a body. In Express, `req.params` holds named path segments, `req.query` holds query-string values, and `req.body` contains parsed request data when a suitable parser is installed. Headers may carry metadata such as content type or authorization, but should not be treated as trustworthy without checking.",
      "The response communicates a status and optional headers and body. Calling `res.json()` serializes a value as JSON and sets the content type. Set the status before sending the body, such as `201` after creating a resource or `204` when a successful response has no body. A request should produce one response; attempting to send a second one causes errors.",
      "Request values often arrive as strings even when they look numeric. Validate shape, length, format, and permissions before using them in database queries or business rules. Avoid returning internal stack traces or secrets to clients. A consistent error response helps the UI display useful feedback without depending on implementation details.",
      '```js\napp.post("/courses", (req, res) => {\n  res.status(201).json({ title: req.body.title });\n});\n```',
    ],
    [
      "Express exposes path, query, body, and header input separately.",
      "`res.json()` sends a JSON response.",
      "Choose the response status before ending the response.",
      "Validate request values and avoid exposing internal errors.",
    ]
  ),
  "node-express-apis::Middleware and Validation": lesson(
    [
      "Express middleware is a function that runs during the request pipeline. It can inspect or update the request, send a response, or call `next()` to continue. Middleware is commonly used for JSON parsing, logging, authentication, rate limiting, and error handling. Order matters: a parser must run before routes that read the parsed body, and a not-found handler usually belongs after application routes.",
      "Validation checks whether incoming data has the expected shape and constraints. A schema can require a title, limit its length, and reject malformed identifiers before data reaches application logic. Validation should cover values from path parameters, query strings, and request bodies. Authentication answers who is calling; authorization checks whether that caller may perform this particular action.",
      "Centralized error middleware receives errors and translates them into safe HTTP responses. Do not silently turn unexpected failures into success-shaped responses. Keep validation errors distinct from unavailable services and database failures, but do not reveal stack traces or private data. Tests should exercise both accepted input and representative invalid values.",
      '```js\napp.use(express.json());\napp.post("/courses", validateCourse, createCourse);\napp.use(errorHandler);\n```',
    ],
    [
      "Middleware runs in order through the request pipeline.",
      "Validate input from every request source.",
      "Authentication and authorization answer different questions.",
      "Centralize errors without hiding unexpected failures.",
    ]
  ),
  "node-express-apis::Designing REST Endpoints": lesson(
    [
      "A REST-style API models resources and uses HTTP methods to express operations. Resource paths usually use nouns, such as `/courses` and `/courses/:id/lessons`, rather than verbs. `GET` reads, `POST` creates or starts an operation, `PATCH` changes selected fields, and `DELETE` removes a resource. Consistency makes an API easier for clients and maintainers to learn.",
      "Use stable identifiers in paths and validate them before querying a database. Choose status codes that match the outcome: `200` for a successful response, `201` for creation, `204` for success with no body, and `404` when a resource is absent. Validation failures commonly use `400` or `422`, according to the project's convention. Avoid returning a different response shape for the same operation without a reason.",
      "Keep endpoints focused and protect operations with the appropriate authentication and authorization checks. Pagination and filtering help collections remain manageable. Document expected inputs and outputs, including error cases. Tests should verify behavior through the public HTTP interface so routing, validation, and serialization are checked together.",
      '```js\napp.patch("/courses/:id", validateCoursePatch, async (req, res) => {\n  res.json(await updateCourse(req.params.id, req.body));\n});\n```',
    ],
    [
      "Use resource nouns and HTTP methods consistently.",
      "Validate identifiers and request payloads.",
      "Choose status codes that describe the result.",
      "Test endpoints through their public HTTP behavior.",
    ]
  ),
  "python-programming::Python Setup and Syntax": lesson(
    [
      "Python is a general-purpose language known for readable syntax. A Python program is commonly saved in a `.py` file and run with the Python interpreter. Many projects use a virtual environment so installed packages are isolated from other projects. The exact command differs across operating systems, but `python --version` or `python3 --version` helps confirm which interpreter is available.",
      "Python uses indentation to define blocks rather than braces. A colon introduces a block after statements such as `if`, `for`, and `def`, and the following lines must be indented consistently. Four spaces are the common convention. Names are case-sensitive, and comments begin with `#`. Clear variable and function names make code easier to read without lengthy explanations.",
      "Use `print()` to display a value while learning and read error messages carefully; they identify the file and line where Python encountered a problem. Keep related code in functions as a program grows. A small script can begin with input, transform a value, and print a result. Later, modules let code be separated into files and reused.",
      '```python\nname = "Ari"\nprint(f"Hello, {name}!")\n```',
    ],
    [
      "Run `.py` files with a Python interpreter.",
      "Indentation defines Python code blocks.",
      "Names are case-sensitive and comments begin with `#`.",
      "Virtual environments isolate project dependencies.",
    ]
  ),
  "python-programming::Variables and Data Types": lesson(
    [
      "A Python variable is a name bound to an object. Assignment uses `=`, and Python determines the object's type at runtime. Common built-in types include integers, floating-point numbers, strings, booleans, and `None`. A name can later refer to a value of another type, but changing types unexpectedly can make a program harder to understand.",
      "Strings hold text and can be combined or formatted; f-strings insert values into readable text. Numbers support arithmetic, though integer division with `/` produces a float and floor division with `//` rounds down. Convert input deliberately because `input()` always returns a string. Validate user values before using them in calculations or database operations.",
      "Lists, dictionaries, and other collections group values and are objects rather than primitive scalar types. Assigning a collection to another name does not automatically copy it; both names may refer to the same object. Use descriptive names and choose data types that match the operations you need. `type()` is useful during practice, but program logic should generally rely on clear structures and checks.",
      '```python\nraw_score = input("Score: ")\nscore = float(raw_score)\nprint(f"Score recorded: {score:.1f}")\n```',
    ],
    [
      "Variables are names bound to runtime values.",
      "Convert `input()` strings before numeric calculations.",
      "Lists and dictionaries are mutable collection objects.",
      "Choose types and names that express intended use.",
    ]
  ),
  "python-programming::Conditions and Loops": lesson(
    [
      "A conditional lets a program choose behavior based on a test. `if` runs a block when its condition is true, `elif` checks another condition, and `else` handles the remaining cases. Python treats some values as truthy or falsy, but explicit comparisons are often clearer for beginners. Use `and`, `or`, and `not` to combine boolean expressions, with parentheses when they improve readability.",
      "A `for` loop visits items in an iterable, such as a list or the values from `range()`. A `while` loop repeats as long as its condition remains true and needs a clear path that changes the condition. `break` exits a loop; `continue` skips to the next iteration. Avoid loops whose stopping condition cannot be reached.",
      "Indentation defines each block, so keep the body aligned consistently. Loops can contain conditions, but deeply nested control flow is harder to reason about. When a task has several cases, name intermediate values or move a repeated operation into a function. Test boundary values such as an empty collection, zero, and the final loop iteration.",
      '```python\nfor score in [58, 84, 92]:\n    if score >= 80:\n        print("Ready for the next topic")\n```',
    ],
    [
      "`if`, `elif`, and `else` select conditional branches.",
      "`for` iterates through items; `while` depends on a condition.",
      "Make loop exit conditions clear and reachable.",
      "Check boundary cases when testing control flow.",
    ]
  ),
  "python-programming::Functions and Modules": lesson(
    [
      "A function gives a name to reusable behavior. Define one with `def`, list its parameters in parentheses, and indent the body. `return` sends a result back to the caller; a function without an explicit return produces `None`. Parameters let the same function work with different input values, while local variables keep implementation details inside the function.",
      "A module is a Python file that can be imported by another file. Modules help separate responsibilities and reuse code without copying it. Import only the names you need or import the module and qualify its members for clarity. Python executes top-level statements when a module is first imported, so keep module initialization predictable and avoid unwanted side effects.",
      "Good functions have clear names, focused responsibilities, and documented expectations when necessary. Use default parameter values carefully: mutable objects such as lists should not usually be used as defaults because the same object may be reused across calls. Test the function with typical inputs and edge cases, including empty values and invalid data.",
      "```python\ndef average(values):\n    return sum(values) / len(values) if values else 0\n```",
    ],
    [
      "Define reusable behavior with `def`.",
      "`return` sends a result; omitted returns produce `None`.",
      "Modules organize related code for import and reuse.",
      "Avoid mutable objects as default parameter values.",
    ]
  ),
  "python-programming::Lists and Dictionaries": lesson(
    [
      "A list stores an ordered sequence of values. Lists can be indexed from zero, sliced to access a range, and changed with operations such as `append()`. Accessing an index outside the list raises an error, so check the length or iterate over items when the position is not guaranteed. A list can hold values of mixed types, though a consistent shape is easier to work with.",
      "A dictionary stores key-value pairs. Keys are used to look up corresponding values, and keys should be hashable, commonly strings or numbers. Use `get()` when a key may be missing, or test membership with `in` before indexing. Dictionaries are useful for records with named fields, such as a learner's name and current level.",
      "Both structures are mutable, meaning their contents can change after creation. A shallow copy duplicates the outer container but may still share nested objects. Choose a list when order and iteration matter, and a dictionary when lookup by a descriptive key is central. Avoid relying on numeric positions to represent records whose fields have stable names.",
      '```python\nlearner = {"name": "Ari", "score": 88}\nlearner["passed"] = learner["score"] >= 70\nprint(learner.get("name"))\n```',
    ],
    [
      "Lists preserve order and use zero-based indexes.",
      "Dictionaries look up values by keys.",
      "Use `get()` or membership checks for optional keys.",
      "Both collections can be mutated after creation.",
    ]
  ),
  "sql-databases::Relational Database Basics": lesson(
    [
      "A relational database stores information in tables made of rows and columns. A row represents one record, while a column describes one attribute shared by those records. Each table should represent a clear kind of entity, such as a course or learner. Splitting related information into separate tables can reduce repeated values and make updates more reliable.",
      "A primary key uniquely identifies each row. A foreign key stores a value that refers to a key in another table, expressing a relationship. Constraints can require values, prevent duplicates, and keep references valid. These rules are important because applications can contain mistakes and several users may change data at the same time.",
      "SQL is a language for defining, querying, and changing relational data. A `SELECT` statement reads rows, while `INSERT`, `UPDATE`, and `DELETE` change them. Transactions group related changes so they can be committed together or rolled back on failure. Start by understanding the tables and their keys, then write queries that ask a specific question without returning unnecessary data.",
      "```sql\nCREATE TABLE courses (\n  id INTEGER PRIMARY KEY,\n  title TEXT NOT NULL\n);\n```",
    ],
    [
      "Tables organize records into rows and columns.",
      "Primary keys identify rows; foreign keys relate tables.",
      "Constraints protect data integrity.",
      "Transactions group changes into reliable operations.",
    ]
  ),
  "sql-databases::Selecting and Filtering Data": lesson(
    [
      "A `SELECT` query chooses columns from one or more rows in a table. Listing the columns explicitly makes the result shape clear and avoids fetching data the application does not need. The `FROM` clause names the source table. If two tables share a related key, a join can combine their rows, but begin with one table to learn the basic structure.",
      "A `WHERE` clause filters rows before they appear in the result. Comparisons can check equality, ranges, and patterns; `AND` and `OR` combine conditions. Parentheses are helpful when conditions mix because boolean precedence affects which rows match. SQL uses `IS NULL` to test for a missing value; `= NULL` does not work as a normal equality comparison.",
      "Parameterized queries keep values separate from SQL text and help prevent injection when values come from users. A literal filter is fine for a fixed example, but application code should bind user input through the database driver's parameter mechanism. Check query results with realistic data and verify how the database treats case, whitespace, and nulls.",
      "```sql\nSELECT title, category\nFROM courses\nWHERE category = 'Programming';\n```",
    ],
    [
      "Name the columns you need in a `SELECT` query.",
      "`WHERE` filters which rows are returned.",
      "Use `IS NULL` to test for missing values.",
      "Bind external values instead of concatenating SQL text.",
    ]
  ),
  "sql-databases::Sorting and Aggregation": lesson(
    [
      "Without an `ORDER BY` clause, SQL does not promise a particular row order. Specify one or more columns to sort results, and add `ASC` or `DESC` to make the direction clear. If several rows share the same sort value, a second column can provide a stable tie-breaker. Sorting is applied to the result after filtering.",
      "Aggregate functions summarize groups of rows. `COUNT` counts records, `SUM` totals numbers, `AVG` calculates an average, and `MIN` or `MAX` finds boundary values. `GROUP BY` forms groups based on shared column values, and the query returns one aggregate row per group. Every selected expression must either be grouped or aggregated, subject to database rules.",
      "`WHERE` filters input rows before grouping; `HAVING` filters groups after the aggregate is calculated. Null handling can affect counts and averages, so know whether a function ignores null values. A useful report states which records were included, how they were grouped, and how the output is ordered.",
      "```sql\nSELECT category, COUNT(*) AS course_count\nFROM courses\nGROUP BY category\nORDER BY course_count DESC;\n```",
    ],
    [
      "Use `ORDER BY` when result ordering matters.",
      "Aggregate functions summarize groups of rows.",
      "`WHERE` filters rows before `GROUP BY`.",
      "`HAVING` filters completed groups.",
    ]
  ),
  "sql-databases::Joining Tables": lesson(
    [
      "A join combines rows from related tables. An `INNER JOIN` returns rows whose join condition matches on both sides. A `LEFT JOIN` returns every row from the left table and fills right-side columns with null when no match exists. Choose the join that matches the question being asked, not simply the one that produces more rows.",
      "Join conditions commonly compare a foreign key with a primary key. If a relationship is one-to-many, one row from the parent can match several child rows, so the result may contain repeated parent values. That is expected and does not mean the database duplicated the parent record. Aggregations may be needed when the desired output is one row per parent.",
      "Qualify column names with table aliases when names overlap or the query becomes long. A missing or incorrect join condition can produce a Cartesian product, multiplying rows unexpectedly. Inspect the number of results and test a small known example. Use `NULL` checks carefully after an outer join, because a null in the result may indicate no matching row.",
      "```sql\nSELECT courses.title, lessons.title AS lesson\nFROM courses\nJOIN lessons ON lessons.course_id = courses.id;\n```",
    ],
    [
      "`INNER JOIN` returns matching rows from both tables.",
      "`LEFT JOIN` retains every row from its left side.",
      "One-to-many joins can repeat parent values in results.",
      "Check join conditions to avoid unexpected row multiplication.",
    ]
  ),
  "sql-databases::Tables and Relationships": lesson(
    [
      "Database tables should model entities and relationships clearly. A column should hold one kind of value, and each row should describe one record. A primary key provides a stable identity; a foreign key links a record to another table. Choose data types that reflect the values being stored, and use constraints to prevent invalid states such as a missing required title.",
      "One-to-many relationships are represented by placing the foreign key on the many side. Many-to-many relationships usually need a junction table containing foreign keys to both related tables. This avoids storing lists of IDs inside a single text column and allows the database to enforce each link. Unique constraints can prevent duplicate pairings.",
      "Normalization reduces repeated facts and update anomalies, but a good design also considers the queries the application must perform. Indexes can speed up filtering and joins, while adding write cost and storage use. Create indexes for actual access patterns and review query performance rather than indexing every column. Schema changes should be applied carefully and tested against existing data.",
      "```sql\nCREATE TABLE enrollments (\n  learner_id INTEGER NOT NULL,\n  course_id INTEGER NOT NULL,\n  UNIQUE (learner_id, course_id)\n);\n```",
    ],
    [
      "Use keys and constraints to maintain valid relationships.",
      "A junction table represents many-to-many links.",
      "Normalization reduces repeated facts and update anomalies.",
      "Add indexes for observed query patterns.",
    ]
  ),
  "data-analytics-python::Working with Data": lesson(
    [
      "Data analysis turns observations into answers to a clear question. Before writing code, identify what each row represents, what each column means, and how the data was collected. A dataset can have missing, duplicated, or incorrectly formatted values, so inspecting it is part of analysis rather than a separate cleanup chore.",
      "Python libraries such as pandas represent tabular data in a DataFrame. A DataFrame has labeled columns and indexed rows, and its operations can filter, transform, and summarize information. Always inspect the shape, column names, data types, and a few representative rows before drawing conclusions. A column containing numbers as text may need conversion before arithmetic is meaningful.",
      "Analysis should be reproducible. Keep the original data unchanged, record important cleaning steps, and write code that can run again on the same input. A useful output connects back to the original question and includes enough context to interpret the result. Do not treat a pattern in a small dataset as proof of causation.",
      '```python\nimport pandas as pd\n\ndata = pd.DataFrame({"score": [72, 84, 91]})\nprint(data["score"].mean())\n```',
    ],
    [
      "Start with a precise question about the dataset.",
      "Inspect shape, columns, types, and sample rows.",
      "Keep analysis steps reproducible.",
      "A pattern does not by itself prove causation.",
    ]
  ),
  "data-analytics-python::Loading a Dataset": lesson(
    [
      "A dataset must be loaded into a structure the analysis tools can work with. Pandas provides functions such as `read_csv()` for comma-separated files. The path is interpreted relative to the program's working directory unless an absolute path is used. Confirm where the script runs and handle missing files explicitly instead of assuming every machine has the same folder layout.",
      "CSV files are plain text and may contain quoting, delimiters, headers, and encodings that affect parsing. Check the first rows, column names, shape, and inferred data types after loading. If a number column contains commas or labels, pandas may infer it as text. Convert it only after identifying and addressing unexpected values.",
      "Large datasets can use substantial memory. Read only required columns or process data in chunks when necessary, and verify that the chosen approach does not change the question being answered. Keep source files separate from generated output so a script does not overwrite its input. Record the data source and date when those details matter to interpreting results.",
      '```python\nimport pandas as pd\n\ndata = pd.read_csv("learners.csv")\nprint(data.shape, data.columns.tolist())\n```',
    ],
    [
      "Use a suitable reader such as pandas `read_csv()`.",
      "Check paths, headers, dimensions, and inferred types.",
      "Convert text columns only after checking their values.",
      "Keep source files separate from generated outputs.",
    ]
  ),
  "data-analytics-python::Cleaning Missing Values": lesson(
    [
      "Missing values are different from zero or an empty string, and they can change summary results. In pandas, `isna()` helps identify them and `notna()` selects records with known values. First measure how much data is missing in each column and consider why it is absent. A missing value may indicate a skipped question, an unavailable measurement, or an import problem.",
      "There is no universal rule for replacing missing data. Dropping rows can be reasonable when only a few unimportant values are absent, but it can bias results if missingness is systematic. Filling with a mean, median, or category may be appropriate for some analyses, but the choice should be justified and documented. Never fill merely to make a chart or calculation run.",
      "After cleaning, compare row counts and key summaries with the original dataset. Preserve the raw input so decisions can be revisited. If missing values carry meaning, represent that meaning explicitly rather than hiding it. Clear cleaning steps help another analyst reproduce the result and understand its limitations.",
      '```python\nmissing_counts = data.isna().sum()\nclean = data.dropna(subset=["score"])\nprint(missing_counts)\n```',
    ],
    [
      "Measure missingness before choosing how to handle it.",
      "Missing data is not automatically equivalent to zero.",
      "Document and justify removal or imputation decisions.",
      "Compare cleaned data with the original input.",
    ]
  ),
  "data-analytics-python::Summaries and Grouping": lesson(
    [
      "A summary reduces many observations to values that help describe a dataset. Common measures include count, mean, median, minimum, and maximum. The mean is sensitive to unusually large or small values, while the median is the middle value after sorting and can be more representative for skewed data. Always consider the distribution and units before interpreting a summary.",
      "Grouping divides rows by one or more categories before calculating summaries. In pandas, `groupby()` creates groups and an aggregation computes a result for each group. Check how null categories are treated and whether each group has enough observations to support a comparison. Averages from groups of very different sizes can hide important differences.",
      "A descriptive summary does not explain why a difference exists. Record the filtering and grouping choices, include counts alongside rates or averages, and look for data-quality problems that may explain surprising results. A clear table or plot should answer one question without implying more certainty than the data provides.",
      '```python\nsummary = data.groupby("course")["score"].agg(["count", "mean", "median"])\nprint(summary)\n```',
    ],
    [
      "Choose summaries that suit the distribution and question.",
      "`groupby()` summarizes observations by categories.",
      "Include group sizes when comparing averages.",
      "Descriptive differences do not establish causes.",
    ]
  ),
  "data-analytics-python::Communicating Insights": lesson(
    [
      "An insight is useful when it answers a stakeholder's question and explains why the result matters. Begin with the main finding, then show the evidence, the method, and relevant limitations. Use plain language and define technical terms that the audience needs. Distinguish what the data shows from an interpretation or recommendation.",
      "Choose a chart that fits the comparison. A bar chart can compare categories, a line chart can show change over ordered time, and a scatter plot can reveal relationships between two numeric variables. Label axes, units, and time periods. Avoid truncated or inconsistent scales that make differences appear larger than they are, and use color palettes that remain readable.",
      "Include the data source, sample size, and important exclusions when they affect interpretation. Do not hide uncertainty or imply that correlation proves causation. A concise report should make it possible for someone else to reproduce the conclusion and ask useful follow-up questions. Review the chart at its actual display size before sharing it.",
      '```python\nax = data.groupby("course")["score"].mean().plot(kind="bar")\nax.set_ylabel("Average score (%)")\nax.set_xlabel("Course")\n```',
    ],
    [
      "Lead with a finding that answers the audience's question.",
      "Choose chart types that match the comparison.",
      "Label units and disclose important limitations.",
      "Do not present correlation as proof of causation.",
    ]
  ),
  "generative-ai-foundations::What Generative AI Can Do": lesson(
    [
      "Generative AI systems produce new content from patterns learned during training. Depending on the model, that content can include text, code, images, audio, or other media. A language model generates a response by estimating likely next tokens from its input and prior context. It does not retrieve a guaranteed true answer simply because a response sounds fluent.",
      "These tools can help brainstorm, summarize, explain, draft, or transform material, but results need review. A model may omit important details, make up sources, or reflect biases present in its training or prompt. Use it as an assistant for a bounded task rather than as an unquestioned authority, especially when decisions affect people or require current facts.",
      "Good use begins with a clear goal, appropriate context, and an evaluation step. Check factual claims against trustworthy sources, run generated code in a safe environment, and verify that outputs fit the audience and constraints. Never provide private data unless the service and policy allow it. Human judgment remains responsible for how generated content is used.",
      "```text\nGoal: Explain one idea\nContext: Beginner learner\nOutput: Short explanation with an example\n```",
    ],
    [
      "Generative models produce content from learned patterns.",
      "Fluent output can still contain errors or unsupported claims.",
      "Review results before using them for important decisions.",
      "Protect private data and use a clearly bounded task.",
    ]
  ),
  "generative-ai-foundations::Models, Tokens, and Context": lesson(
    [
      "A language model processes text as tokens, which may represent whole words, word pieces, punctuation, or other units. A token is not always one word or one character. The model's input and output are limited by a context window measured in tokens, so long conversations or documents can exceed what it can consider at once.",
      "Context usually includes the current instruction, the user prompt, and some conversation history. If the total becomes too large, a system may omit, summarize, or reject older material. Put the most important constraints and information in a clear, compact form. For a long document, refer to the relevant excerpt instead of assuming the model remembers every detail.",
      "The context window is not the same as long-term memory or factual knowledge. A model may not know recent events unless a connected tool supplies them, and text in context can still be misunderstood. When exact details matter, quote the source or attach structured data and check the response against it. Avoid treating token counts as a measure of truth or reasoning quality.",
      "```text\nInstruction: Define the term simply.\nSource: [relevant excerpt]\nQuestion: Give one example from the excerpt.\n```",
    ],
    [
      "Tokens are model input units, not exactly words.",
      "Context windows limit how much input is considered at once.",
      "A context window is not persistent memory.",
      "Provide relevant source material for precise answers.",
    ]
  ),
  "generative-ai-foundations::Writing Clear Prompts": lesson(
    [
      "A prompt is the instruction and context a generative model receives. Clear prompts state the task, audience, useful background, constraints, and desired output. Specificity reduces guesswork, but adding irrelevant details can distract from the goal. Describe what a successful answer should contain and what it should avoid, using language that can be checked.",
      "For a complex request, break the work into stages or ask for a structured format. A small example can show the expected style or shape, but it should not conflict with the task. If the model needs source facts, provide them or point to a trusted tool rather than expecting it to infer private or current information.",
      "Prompting is iterative. Review the output against the original requirements, clarify missing context, and ask for a correction when needed. Do not rely on wording tricks to guarantee correctness or safety. Sensitive decisions need appropriate human review. Keep prompts concise enough that the important instructions remain visible within the available context.",
      "```text\nExplain [concept] to a beginner in three steps.\nUse only this source: [excerpt]\nEnd with one short example.\n```",
    ],
    [
      "State the task, audience, context, and output shape.",
      "Supply source facts instead of asking the model to guess.",
      "Review each response against the original requirements.",
      "Prompt wording cannot guarantee correctness.",
    ]
  ),
  "generative-ai-foundations::Evaluating AI Responses": lesson(
    [
      "Evaluate an AI response by checking whether it answers the question, follows constraints, and is supported by evidence. Fluent wording is not proof of accuracy. Verify factual claims against reliable sources, especially dates, quotations, calculations, citations, and technical details. If a claim cannot be checked, say that it remains uncertain rather than presenting it as established fact.",
      "Look for omissions and hidden assumptions as well as direct errors. A response may be technically correct but incomplete, biased, outdated, or unsuitable for its audience. Compare multiple sources when a decision matters, and test generated code with representative inputs. A model's confidence or polished tone should not replace independent verification.",
      "Evaluation depends on risk. A casual brainstorming list needs less scrutiny than medical, legal, financial, or safety-critical guidance. Define acceptance criteria before using the output, document important checks, and ask a qualified person to review high-impact decisions. Treat model output as a draft that needs accountable human judgment.",
      "```text\nClaim: [statement to verify]\nSource: [independent reference]\nResult: supported / contradicted / uncertain\n```",
    ],
    [
      "Check claims against reliable, independent sources.",
      "Look for omissions, bias, and hidden assumptions.",
      "Test generated code rather than trusting its explanation.",
      "Scale review effort to the impact of the decision.",
    ]
  ),
  "generative-ai-foundations::Responsible AI Use": lesson(
    [
      "Responsible AI use considers privacy, fairness, transparency, and the consequences of an output. Do not submit personal, confidential, or regulated information to a service unless its terms and your organization's policy permit it. Use the minimum data needed for the task, and remove identifiers when they are not necessary.",
      "Models can reproduce or amplify patterns in training data. Review outputs for stereotypes, exclusion, and uneven performance across groups. Be transparent when people should know that content was generated or materially assisted by AI. Give people a way to challenge or correct important automated decisions, and do not delegate accountability to a model.",
      "The appropriate safeguards depend on the use case. Low-risk drafting and high-impact decisions should not be treated alike. Keep a human responsible for reviewing consequential outputs, protect data, and document limitations. If the model gives harmful or irrelevant content, stop using that result and follow the service's reporting or escalation process.",
      "```text\nBefore sharing: remove private details, verify claims,\nand ask who could be affected by this output.\n```",
    ],
    [
      "Protect personal and confidential information.",
      "Review outputs for unfair or exclusionary patterns.",
      "Disclose AI assistance when it is material to the audience.",
      "Keep human accountability for consequential decisions.",
    ]
  ),
  "git-github::Version Control Basics": lesson(
    [
      "Version control records how files change over time. Git stores snapshots called commits, which let a team inspect history, compare versions, and restore earlier work. It also makes parallel work safer by letting contributors develop changes separately before combining them. A repository contains the project files and Git's history for that project.",
      "A working tree is the current set of files. The staging area lets you choose which changes will become the next commit, so one commit can contain a focused unit of work even when other edits are present. `git status` shows the current branch and uncommitted changes. A commit records staged content along with a message and metadata.",
      "Git can be used locally without a hosted service. GitHub hosts Git repositories and adds collaboration features such as issues, pull requests, and code review. A remote is a named connection to another repository. Learn the local workflow first, keep commits small and descriptive, and avoid committing secrets such as passwords or access tokens.",
      '```bash\ngit status\ngit add index.html\ngit commit -m "Add page structure"\n```',
    ],
    [
      "Git records project history as commits.",
      "The working tree and staging area serve different roles.",
      "`git status` summarizes pending changes.",
      "Never commit credentials or other secrets.",
    ]
  ),
  "git-github::Commits and Change History": lesson(
    [
      "A commit is a saved snapshot of staged changes. Before committing, inspect `git status` and review the diff so the snapshot contains only the intended work. A focused commit should represent one logical change; unrelated edits are easier to review and revert when they are recorded separately. Commit messages should briefly describe the change in the imperative or the project's established style.",
      "Git history is a graph, not merely a list, because different branches may develop independently and later connect. Commands such as `git log` show commits, while `git show` inspects a particular commit's changes. A commit identifies its parent and content, so changing a file later creates a new snapshot rather than editing the old one.",
      "Use `.gitignore` for generated files and local configuration that should not be tracked, but remember that ignoring a file does not remove it if it is already tracked. Before sharing a commit, check for sensitive data and large generated artifacts. Good history explains why changes were made and helps another developer understand the project's evolution.",
      '```bash\ngit diff\ngit add src/app.js\ngit commit -m "Validate course input"\n```',
    ],
    [
      "Review staged changes before creating a commit.",
      "Keep commits focused on one logical change.",
      "`git log` and `git show` help inspect history.",
      "Ignoring a tracked file does not untrack it.",
    ]
  ),
  "git-github::Branches and Merging": lesson(
    [
      "A branch is a movable name pointing to a commit. It allows work to progress independently from another line of development. Create a branch for a feature or fix, make commits there, and update it from the shared branch according to the team's workflow. Clear branch names help collaborators understand the purpose of the work.",
      "Merging combines histories. Git can complete a merge automatically when changes do not conflict. A conflict occurs when Git cannot determine how overlapping edits should be combined; a developer must inspect the affected files, choose the correct result, and mark the conflict resolved before completing the merge. Never accept one side blindly without understanding the intended behavior.",
      "A fast-forward merge moves the target branch pointer when it has no separate commits to combine. Other merges create a commit joining the histories. Rebasing can replay commits onto a new base, but rewriting shared history can disrupt collaborators. Follow repository conventions, test after integrating changes, and use a clean working tree before changing branches.",
      "```bash\ngit switch -c feature/course-search\ngit status\ngit merge main\n```",
    ],
    [
      "Branches provide separate lines of development.",
      "Merge conflicts require a deliberate content decision.",
      "Rewriting shared history can disrupt collaborators.",
      "Test after merging or rebasing changes.",
    ]
  ),
  "git-github::Working with GitHub": lesson(
    [
      "GitHub is a hosted platform for Git repositories and team collaboration. A local repository can connect to a remote using a URL and a short name such as `origin`. Fetching downloads remote references without changing the current branch; pulling usually fetches and then integrates a selected branch. Pushing sends local commits to a remote when permissions allow.",
      "A repository page can contain files, documentation, issues, and project settings. Protect important branches with review and status-check rules so changes are checked before integration. Keep credentials private and use the platform's supported authentication methods instead of embedding tokens in URLs or scripts.",
      "Collaboration features should make work visible and reviewable. Issues describe work or problems, while pull requests propose changes and provide discussion, checks, and review. A remote branch is not automatically the same as the local branch, so verify which branch and remote a command targets. Read command output before repeating an operation that may already have succeeded.",
      "```bash\ngit remote -v\ngit fetch origin\ngit push -u origin feature/course-search\n```",
    ],
    [
      "Remotes connect local repositories to hosted repositories.",
      "Fetch downloads references; push publishes local commits.",
      "Protect credentials and verify the target branch.",
      "Pull requests support review and automated checks.",
    ]
  ),
  "git-github::Pull Requests and Reviews": lesson(
    [
      "A pull request proposes integrating one branch into another. It gives reviewers a focused diff, a description of the intent, and a place to discuss design choices. A useful description explains what changed, why it changed, how it was verified, and any known limitations. Keep the change set small enough that reviewers can understand it.",
      "Reviewers check correctness, maintainability, tests, security, and alignment with project conventions. Feedback should point to a specific concern and explain its impact. Authors can respond by updating the branch, clarifying intent, or discussing a different solution. Automated checks provide repeatable evidence, but they do not replace careful review of behavior.",
      "Before merging, ensure required checks pass and conversations are resolved according to team policy. The merge method may preserve individual commits, combine them, or rebase them; follow repository practice. Do not treat approval as proof that no defect exists. Continue to monitor the application after release and correct problems with a new, traceable change.",
      "```text\nSummary: What changed and why\nVerification: Tests and manual checks performed\nRisk: Known limitations or follow-up work\n```",
    ],
    [
      "A pull request proposes a reviewable branch change.",
      "Descriptions should explain intent and verification.",
      "Automated checks complement human review.",
      "Follow repository policy before merging.",
    ]
  ),
  "ui-ux-design::UX and UI Roles": lesson(
    [
      "User experience, or UX, concerns how people accomplish goals with a product. It includes understanding needs, arranging workflows, and checking whether the experience is useful and understandable. User interface, or UI, concerns the controls and visual presentation people interact with. The areas overlap: visual choices affect usability, and interface details support the broader experience.",
      "A UX designer may research users, map tasks, build prototypes, and evaluate usability. A UI designer may define visual hierarchy, typography, color, spacing, and component states. In many teams, one person contributes to both areas, while developers and product partners share responsibility for the final experience. Job titles vary, so communicate responsibilities and decisions explicitly.",
      "A polished interface is not automatically a good experience if it makes the user's goal hard to reach. Likewise, a clear workflow can still fail if text is unreadable or controls are difficult to operate. Begin with the problem and people affected, then use sketches and prototypes to test assumptions before implementation. Accessibility and content clarity belong throughout the process, not only at the end.",
      "```text\nUser goal -> task flow -> interface choices -> usability check\n```",
    ],
    [
      "UX focuses on the overall experience and user goals.",
      "UI focuses on the interface people see and operate.",
      "Visual polish does not guarantee a usable workflow.",
      "Test assumptions early with sketches or prototypes.",
    ]
  ),
  "ui-ux-design::Understanding Users": lesson(
    [
      "Understanding users begins by learning about their goals, context, constraints, and existing workarounds. Research methods include interviews, observation, surveys, and analysis of support or product data. Choose a method that can answer the question you have; a survey can count reported preferences, while observation may reveal steps people forget to mention.",
      "Recruit participants who reflect the people affected by the product, and avoid leading questions that suggest a preferred answer. Ask about specific past behavior rather than asking people to predict what they might do. Respect privacy, obtain appropriate consent, and record only the information needed for the research purpose.",
      "Research findings are evidence, not a license to stereotype. Personas or summaries should be grounded in patterns from real data and should describe needs rather than inventing demographic traits. Share limitations and contradictory observations. Use what you learn to refine a problem statement, then validate design ideas with additional research or usability checks.",
      "```text\nAsk: “Tell me about the last time you tried to finish this task.”\nAvoid: “Would you use our new, faster feature?”\n```",
    ],
    [
      "Choose research methods based on the question.",
      "Ask about specific behavior rather than imagined preferences.",
      "Obtain consent and minimize collected personal data.",
      "Ground user summaries in evidence, not stereotypes.",
    ]
  ),
  "ui-ux-design::Mapping a User Journey": lesson(
    [
      "A user journey maps the steps and experiences a person encounters while trying to reach a goal. A map may include stages, actions, questions, emotions, channels, and pain points. It helps a team see the experience across screens or departments instead of evaluating one interface in isolation.",
      "Define whose journey is being mapped, the goal, and the boundaries. A current-state journey describes what people do today; a future-state journey describes an intended experience. Separate observed evidence from assumptions, and note where information is uncertain. A journey map is most useful when it reflects research rather than a team's preferred process.",
      "Look for friction such as repeated data entry, unclear next steps, or handoffs where people lose context. Prioritize opportunities by user impact and feasibility, then validate improvements with the people who will use them. A diagram is a discussion tool, not proof that the proposed journey is correct. Keep it updated as the product and surrounding service change.",
      "```text\nDiscover -> Compare -> Choose -> Complete task -> Get confirmation\n```",
    ],
    [
      "A journey map follows a person toward a specific goal.",
      "Distinguish observed facts from assumptions.",
      "Include steps across channels, not only screens.",
      "Validate proposed improvements with users.",
    ]
  ),
  "ui-ux-design::Wireframes and Hierarchy": lesson(
    [
      "A wireframe is a simplified representation of a screen's structure. It focuses attention on content, layout, and interaction before detailed visual styling. Low-fidelity sketches are quick to change and useful for comparing alternatives. Add enough labels and behavior notes that collaborators understand what each region is for.",
      "Visual hierarchy communicates what to notice first and how information relates. Size, position, spacing, contrast, and typography can establish emphasis, but they should support the user's task. A clear page groups related controls, gives headings meaningful order, and makes the primary action easy to identify without hiding secondary choices.",
      "Wireframes are hypotheses, not final designs. Test whether people can find information and complete representative tasks. Include different states such as loading, empty, error, and success so the design does not only work for ideal data. Ensure the intended hierarchy remains understandable when text is enlarged or viewed on a narrow screen.",
      "```text\n[Page title]\n[Short explanation]\n[Primary content area]\n[Primary action]  [Secondary action]\n```",
    ],
    [
      "Wireframes focus on structure before detailed visual styling.",
      "Hierarchy guides attention through task-relevant emphasis.",
      "Include empty, loading, error, and success states.",
      "Test layouts with realistic content and tasks.",
    ]
  ),
  "ui-ux-design::Usability and Iteration": lesson(
    [
      "Usability describes how effectively, efficiently, and satisfactorily people can use a product for their goals. A usability test gives participants realistic tasks and observes where they succeed, hesitate, or make errors. Ask them to think aloud when appropriate, but avoid coaching them through the interface because that can hide problems.",
      "A small test can reveal confusing labels or missing feedback, but results from a few participants do not represent every user. Record task outcomes and observations separately from interpretations. Look for repeated patterns and consider how severe each obstacle is. Accessibility checks should include keyboard use, focus visibility, readable contrast, and assistive technology where relevant.",
      "Iteration means making a change, then checking whether it improves the experience. Prioritize issues that block important tasks or affect many people. Do not change a design solely to match one participant's preference without understanding the underlying need. Keep a record of what was tested and what remains uncertain so the next round starts with clear evidence.",
      "```text\nTask: Find the lesson notes and mark the lesson complete.\nObserve: completion, errors, hesitation, and questions.\n```",
    ],
    [
      "Test representative tasks by observing real behavior.",
      "Separate observations from interpretations.",
      "Check keyboard access, focus, contrast, and assistive support.",
      "Use evidence to prioritize and verify design changes.",
    ]
  ),
};
