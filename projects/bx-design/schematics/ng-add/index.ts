import { SchematicContext, Tree } from '@angular-devkit/schematics';
import { getWorkspace } from '@schematics/angular/utility/workspace';

import { Schema } from './schema';

async function determineProject(tree: Tree, options: Schema) {
  const workspace = await getWorkspace(tree);

  if (!options.project) {
    options.project = workspace.extensions['defaultProject'] as string;
    const project = workspace.projects.get(options.project);

    if (!project)
      throw new Error(
        [
          '✘ No default project configured.',
          "Specify a project with '--project <project-name>'.",
          'Available projects:' +
            Array.from(workspace.projects.keys()).sort().join(', '),
        ].join('\n'),
      );

    return project;
  }

  const project = workspace.projects.get(options.project);
  if (!project)
    throw new Error(
      [
        '✘ Project not found.',
        'Available projects: ' +
          Array.from(workspace.projects.keys()).sort().join(', '),
      ].join('\n'),
    );

  return project;
}

function updateIndex(
  tree: Tree,
  sourceRoot: string,
  context: SchematicContext,
) {
  const index = { path: `${sourceRoot}/index.html`, content: '' };
  if (tree.exists(index.path)) {
    index.content = tree.read(index.path)!.toString('utf-8');

    const materialIcons = [
      '<!-- Google Material Icons -->',
      '<link href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined" rel="stylesheet" />',
    ];

    if (!index.content.includes(materialIcons[1])) {
      index.content = index.content.replace(
        /<\/head>/i,
        `\n  ${materialIcons.join('\n  ')}\n</head>`,
      );
    }

    tree.overwrite(index.path, index.content);
    context.logger.info("✔ 'Material Icons' was added in your 'index.html'.");

    let comfortaa = [
      '<!-- Google Fonts: Comfortaa -->',
      '<link rel="preconnect" href="https://fonts.googleapis.com">',
      '<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>',
      '<link href="https://fonts.googleapis.com/css2?family=Comfortaa:wght@300..700&display=swap" rel="stylesheet">',
    ];

    if (!index.content.includes(comfortaa[3])) {
      if (index.content.includes(comfortaa[2]))
        comfortaa = comfortaa.filter((_, i) => i != 2);
      if (index.content.includes(comfortaa[1]))
        comfortaa = comfortaa.filter((_, i) => i != 1);

      index.content = index.content.replace(
        /<\/head>/i,
        `\n  ${comfortaa.join('\n  ')}\n</head>`,
      );
    }

    tree.overwrite(index.path, index.content);
    context.logger.info("✔ 'Comfortaa' was added in your 'index.html'.");
  }
}

export function ngAdd(options: Schema) {
  return async (tree: Tree, context: SchematicContext) => {
    // 1. Validate the Workspace
    if (!tree.exists('angular.json')) {
      throw new Error(
        "✘ Workspace Angular not found (missing file 'angular.json').\n" +
          'Run this command inside an Angular Project.',
      );
    }

    // 2. Determine Project
    const project = await determineProject(tree, options);
    const sourceRoot = project.sourceRoot || `${project.root}/src`;

    // 4. Updates index.html
    updateIndex(tree, sourceRoot, context);

    const bxStylesDir = 'src/bx-styles';
    const paletteContent = [
      "@use 'bx-design/palette' as bx-palette;",
      '',
      "$primary: bx-palette.set('primary', 210);",
      "$accent: bx-palette.set('accent', 210);",
      "$warn: bx-palette.set('warn', 210);",
    ]
      .join('\n')
      .trim();

    const typographyContent = [
      "@use 'bx-design/typography' as bx-typography;",
      '',
      "$courier-new: bx-typography.set('courier-new', (",
      "  'font-family': \"'Courier New', monospace\",",
      "  'display-1': ( 'font-size': 3.5rem, 'font-weight': 300, 'letter-spacing': .125rem ),",
      "  'display-2': ( 'font-size': 2.5rem, 'font-weight': 300, 'letter-spacing': .125rem ),",
      "  'title-1': ( 'font-size': 1.75rem, line-height: .8, 'font-weight': 500 ),",
      "  'title-2': ( 'font-size': 1.5rem, line-height: .8, 'font-weight': 500 ),",
      "  'subtitle': ( 'font-size': 1.25rem ),",
      "  'default': ( 'font-size': 1rem ),",
      "  'button': ( 'font-size': 1rem, 'font-weight': 600 ),",
      "  'link': ( 'font-size': 1rem, 'text-decoration': underline ),",
      "  'hint': ( 'font-size': .75rem, 'font-weight': 600 ),",
      '));',
    ]
      .join('\n')
      .trim();

    if (!tree.exists(`${bxStylesDir}/palette.scss`))
      tree.create(`${bxStylesDir}/palette.scss`, paletteContent);

    if (!tree.exists(`${bxStylesDir}/typography.scss`))
      tree.create(`${bxStylesDir}/typography.scss`, typographyContent);

    context.logger.info("✔ Created 'src/bx-styles.'");

    const stylesPath = 'src/styles.scss';
    if (tree.exists(stylesPath)) {
      const content = tree.read(stylesPath)!.toString('utf-8');
      const updated =
        [
          "@use 'bx-design/palette' as bx-palette;",
          "@use 'bx-design/typography' as bx-typography;",
          "@use 'bx-styles/palette';",
          "@use 'bx-styles/typography';",
          '',
          '@include bx-palette.create-classes();',
          '@include bx-typography.create-classes();',
        ].join('\n') + content;

      tree.overwrite(stylesPath, updated);
      context.logger.info("✔ Updated your 'src/styles.scss'");
    }
  };
}
