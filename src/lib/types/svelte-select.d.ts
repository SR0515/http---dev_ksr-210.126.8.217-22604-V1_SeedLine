declare module 'svelte-select' {
  import { SvelteComponentTyped } from 'svelte';

  export interface SelectProps {
    items: any[];
    [key: string]: any;
  }

  export default class Select extends SvelteComponentTyped<SelectProps> {}
}
