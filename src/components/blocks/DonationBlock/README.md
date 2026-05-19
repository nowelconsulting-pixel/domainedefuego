# DonationBlock

Bloc CTA de don interactif pour la page `/faire-un-don`.

## Variantes

| `variant`  | Usage                          | Différence visuelle                           |
|------------|--------------------------------|-----------------------------------------------|
| `default`  | Page `faire-un-don`            | Bloc complet avec H2 et eyebrow               |
| `compact`  | Pages `adopter`, `nos-animaux` | Eyebrow masqué, titre H3 (à styler si activé) |
| `inline`   | Encadré dans un article        | Même rendu (stub — à compléter si nécessaire) |

## Utilisation

```tsx
<DonationBlock block={blockConfig} />
```

Le composant reçoit un seul prop `block` conforme à l'interface `DonationCTABlock` (voir `src/types/admin.ts`).

## Compléter les URLs HelloAsso

Dans `public/data/pages.json`, sous `faire-un-don.blocks[0].helloasso` :

```json
"helloasso": {
  "oneTimeUrl": "https://www.helloasso.com/associations/domaine-de-fuego/formulaires/<ID_PONCTUEL>",
  "monthlyUrl":  "https://www.helloasso.com/associations/domaine-de-fuego/formulaires/<ID_MENSUEL>",
  "amountQueryParam": "montant"
}
```

Remplacer `<ID_PONCTUEL>` et `<ID_MENSUEL>` par les identifiants des formulaires créés dans le back-office HelloAsso.

> ⚠️ Vérifier le nom exact du query param de pré-remplissage du montant dans la sandbox HelloAsso (`montant`, `amount`, ou non supporté).

## Tests

```bash
npm test
```
