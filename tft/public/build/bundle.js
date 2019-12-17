
(function(l, r) { if (l.getElementById('livereloadscript')) return; r = l.createElement('script'); r.async = 1; r.src = '//' + (window.location.host || 'localhost').split(':')[0] + ':35729/livereload.js?snipver=1'; r.id = 'livereloadscript'; l.head.appendChild(r) })(window.document);
var app = (function () {
    'use strict';

    function noop() { }
    function add_location(element, file, line, column, char) {
        element.__svelte_meta = {
            loc: { file, line, column, char }
        };
    }
    function run(fn) {
        return fn();
    }
    function blank_object() {
        return Object.create(null);
    }
    function run_all(fns) {
        fns.forEach(run);
    }
    function is_function(thing) {
        return typeof thing === 'function';
    }
    function safe_not_equal(a, b) {
        return a != a ? b == b : a !== b || ((a && typeof a === 'object') || typeof a === 'function');
    }

    function append(target, node) {
        target.appendChild(node);
    }
    function insert(target, node, anchor) {
        target.insertBefore(node, anchor || null);
    }
    function detach(node) {
        node.parentNode.removeChild(node);
    }
    function destroy_each(iterations, detaching) {
        for (let i = 0; i < iterations.length; i += 1) {
            if (iterations[i])
                iterations[i].d(detaching);
        }
    }
    function element(name) {
        return document.createElement(name);
    }
    function text(data) {
        return document.createTextNode(data);
    }
    function space() {
        return text(' ');
    }
    function listen(node, event, handler, options) {
        node.addEventListener(event, handler, options);
        return () => node.removeEventListener(event, handler, options);
    }
    function attr(node, attribute, value) {
        if (value == null)
            node.removeAttribute(attribute);
        else if (node.getAttribute(attribute) !== value)
            node.setAttribute(attribute, value);
    }
    function children(element) {
        return Array.from(element.childNodes);
    }
    function custom_event(type, detail) {
        const e = document.createEvent('CustomEvent');
        e.initCustomEvent(type, false, false, detail);
        return e;
    }

    let current_component;
    function set_current_component(component) {
        current_component = component;
    }
    function get_current_component() {
        if (!current_component)
            throw new Error(`Function called outside component initialization`);
        return current_component;
    }
    function onMount(fn) {
        get_current_component().$$.on_mount.push(fn);
    }
    function createEventDispatcher() {
        const component = get_current_component();
        return (type, detail) => {
            const callbacks = component.$$.callbacks[type];
            if (callbacks) {
                // TODO are there situations where events could be dispatched
                // in a server (non-DOM) environment?
                const event = custom_event(type, detail);
                callbacks.slice().forEach(fn => {
                    fn.call(component, event);
                });
            }
        };
    }

    const dirty_components = [];
    const binding_callbacks = [];
    const render_callbacks = [];
    const flush_callbacks = [];
    const resolved_promise = Promise.resolve();
    let update_scheduled = false;
    function schedule_update() {
        if (!update_scheduled) {
            update_scheduled = true;
            resolved_promise.then(flush);
        }
    }
    function add_render_callback(fn) {
        render_callbacks.push(fn);
    }
    function add_flush_callback(fn) {
        flush_callbacks.push(fn);
    }
    function flush() {
        const seen_callbacks = new Set();
        do {
            // first, call beforeUpdate functions
            // and update components
            while (dirty_components.length) {
                const component = dirty_components.shift();
                set_current_component(component);
                update(component.$$);
            }
            while (binding_callbacks.length)
                binding_callbacks.pop()();
            // then, once components are updated, call
            // afterUpdate functions. This may cause
            // subsequent updates...
            for (let i = 0; i < render_callbacks.length; i += 1) {
                const callback = render_callbacks[i];
                if (!seen_callbacks.has(callback)) {
                    callback();
                    // ...so guard against infinite loops
                    seen_callbacks.add(callback);
                }
            }
            render_callbacks.length = 0;
        } while (dirty_components.length);
        while (flush_callbacks.length) {
            flush_callbacks.pop()();
        }
        update_scheduled = false;
    }
    function update($$) {
        if ($$.fragment !== null) {
            $$.update();
            run_all($$.before_update);
            $$.fragment && $$.fragment.p($$.ctx, $$.dirty);
            $$.dirty = [-1];
            $$.after_update.forEach(add_render_callback);
        }
    }
    const outroing = new Set();
    let outros;
    function group_outros() {
        outros = {
            r: 0,
            c: [],
            p: outros // parent group
        };
    }
    function check_outros() {
        if (!outros.r) {
            run_all(outros.c);
        }
        outros = outros.p;
    }
    function transition_in(block, local) {
        if (block && block.i) {
            outroing.delete(block);
            block.i(local);
        }
    }
    function transition_out(block, local, detach, callback) {
        if (block && block.o) {
            if (outroing.has(block))
                return;
            outroing.add(block);
            outros.c.push(() => {
                outroing.delete(block);
                if (callback) {
                    if (detach)
                        block.d(1);
                    callback();
                }
            });
            block.o(local);
        }
    }

    const globals = (typeof window !== 'undefined' ? window : global);

    function bind(component, name, callback) {
        const index = component.$$.props[name];
        if (index !== undefined) {
            component.$$.bound[index] = callback;
            callback(component.$$.ctx[index]);
        }
    }
    function create_component(block) {
        block && block.c();
    }
    function mount_component(component, target, anchor) {
        const { fragment, on_mount, on_destroy, after_update } = component.$$;
        fragment && fragment.m(target, anchor);
        // onMount happens before the initial afterUpdate
        add_render_callback(() => {
            const new_on_destroy = on_mount.map(run).filter(is_function);
            if (on_destroy) {
                on_destroy.push(...new_on_destroy);
            }
            else {
                // Edge case - component was destroyed immediately,
                // most likely as a result of a binding initialising
                run_all(new_on_destroy);
            }
            component.$$.on_mount = [];
        });
        after_update.forEach(add_render_callback);
    }
    function destroy_component(component, detaching) {
        const $$ = component.$$;
        if ($$.fragment !== null) {
            run_all($$.on_destroy);
            $$.fragment && $$.fragment.d(detaching);
            // TODO null out other refs, including component.$$ (but need to
            // preserve final state?)
            $$.on_destroy = $$.fragment = null;
            $$.ctx = [];
        }
    }
    function make_dirty(component, i) {
        if (component.$$.dirty[0] === -1) {
            dirty_components.push(component);
            schedule_update();
            component.$$.dirty.fill(0);
        }
        component.$$.dirty[(i / 31) | 0] |= (1 << (i % 31));
    }
    function init(component, options, instance, create_fragment, not_equal, props, dirty = [-1]) {
        const parent_component = current_component;
        set_current_component(component);
        const prop_values = options.props || {};
        const $$ = component.$$ = {
            fragment: null,
            ctx: null,
            // state
            props,
            update: noop,
            not_equal,
            bound: blank_object(),
            // lifecycle
            on_mount: [],
            on_destroy: [],
            before_update: [],
            after_update: [],
            context: new Map(parent_component ? parent_component.$$.context : []),
            // everything else
            callbacks: blank_object(),
            dirty
        };
        let ready = false;
        $$.ctx = instance
            ? instance(component, prop_values, (i, ret, value = ret) => {
                if ($$.ctx && not_equal($$.ctx[i], $$.ctx[i] = value)) {
                    if ($$.bound[i])
                        $$.bound[i](value);
                    if (ready)
                        make_dirty(component, i);
                }
                return ret;
            })
            : [];
        $$.update();
        ready = true;
        run_all($$.before_update);
        // `false` as a special case of no DOM component
        $$.fragment = create_fragment ? create_fragment($$.ctx) : false;
        if (options.target) {
            if (options.hydrate) {
                // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                $$.fragment && $$.fragment.l(children(options.target));
            }
            else {
                // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                $$.fragment && $$.fragment.c();
            }
            if (options.intro)
                transition_in(component.$$.fragment);
            mount_component(component, options.target, options.anchor);
            flush();
        }
        set_current_component(parent_component);
    }
    class SvelteComponent {
        $destroy() {
            destroy_component(this, 1);
            this.$destroy = noop;
        }
        $on(type, callback) {
            const callbacks = (this.$$.callbacks[type] || (this.$$.callbacks[type] = []));
            callbacks.push(callback);
            return () => {
                const index = callbacks.indexOf(callback);
                if (index !== -1)
                    callbacks.splice(index, 1);
            };
        }
        $set() {
            // overridden by instance, if it has props
        }
    }

    function dispatch_dev(type, detail) {
        document.dispatchEvent(custom_event(type, detail));
    }
    function append_dev(target, node) {
        dispatch_dev("SvelteDOMInsert", { target, node });
        append(target, node);
    }
    function insert_dev(target, node, anchor) {
        dispatch_dev("SvelteDOMInsert", { target, node, anchor });
        insert(target, node, anchor);
    }
    function detach_dev(node) {
        dispatch_dev("SvelteDOMRemove", { node });
        detach(node);
    }
    function listen_dev(node, event, handler, options, has_prevent_default, has_stop_propagation) {
        const modifiers = options === true ? ["capture"] : options ? Array.from(Object.keys(options)) : [];
        if (has_prevent_default)
            modifiers.push('preventDefault');
        if (has_stop_propagation)
            modifiers.push('stopPropagation');
        dispatch_dev("SvelteDOMAddEventListener", { node, event, handler, modifiers });
        const dispose = listen(node, event, handler, options);
        return () => {
            dispatch_dev("SvelteDOMRemoveEventListener", { node, event, handler, modifiers });
            dispose();
        };
    }
    function attr_dev(node, attribute, value) {
        attr(node, attribute, value);
        if (value == null)
            dispatch_dev("SvelteDOMRemoveAttribute", { node, attribute });
        else
            dispatch_dev("SvelteDOMSetAttribute", { node, attribute, value });
    }
    function set_data_dev(text, data) {
        data = '' + data;
        if (text.data === data)
            return;
        dispatch_dev("SvelteDOMSetData", { node: text, data });
        text.data = data;
    }
    class SvelteComponentDev extends SvelteComponent {
        constructor(options) {
            if (!options || (!options.target && !options.$$inline)) {
                throw new Error(`'target' is a required option`);
            }
            super();
        }
        $destroy() {
            super.$destroy();
            this.$destroy = () => {
                console.warn(`Component was already destroyed`); // eslint-disable-line no-console
            };
        }
    }

    const BASE_URL = 'https://soronto3603.github.io/tft/constances/';

    const DATA_URLS = {
      LightAlchemist: 'Light-Alchemist-synergies.json',
      LightMystic: 'Light-Mystic-synergies.json',
      LightAssassin: 'Light-Assassin-synergies.json',
      LightOcean: 'Light-Ocean-synergies.json',
      LightAvatar: 'Light-Avatar-synergies.json',
      LightPoison: 'Light-Poison-synergies.json',
      LightBerserker: 'Light-Berserker-synergies.json',
      LightPredator: 'Light-Predator-synergies.json',
      LightBlademaster: 'Light-Blademaster-synergies.json ',
      LightRanger: 'Light-Ranger-synergies.json',
      LightCrystal: 'Light-Crystal-synergies.json',
      LightShadow: 'Light-Shadow-synergies.json',
      LightDesert: 'Light-Desert-synergies.json',
      LightSoulbound: 'Light-Soulbound-synergies.json',
      LightDruid: 'Light-Druid-synergies.json',
      LightSteel: 'Light-Steel-synergies.json',
      LightElectric: 'Light-Electric-synergies.json',
      LightSummoner: 'Light-Summoner-synergies.json',
      LightGlacial: 'Light-Glacial-synergies.json',
      LightWarden: 'Light-Warden-synergies.json',
      LightInferno: 'Light-Inferno-synergies.json',
      LightWind: 'Light-Wind-synergies.json',
      LightLight: 'Light-Light-synergies.json',
      LightWoodland: 'Light-Woodland-synergies.json',
      LightMage: 'Light-Mage-synergies.json',
      LightMountain: 'Light-Mountain-synergies.json',
      ShadowAssassin: 'Shadow-Assassin-synergies.json',
      ShadowAvatar: 'Shadow-Avatar-synergies.json',
      ShadowBerserker: 'Shadow-Berserker-synergies.json',
      ShadowBlademaster: 'Shadow-Blademaster-synergies.json',
      ShadowCrystal: 'Shadow-Crystal-synergies.json',
      ShadowDesert: 'Shadow-Desert-synergies.json',
      ShadowDruid: 'Shadow-Druid-synergies.json',
      ShadowElectric: 'Shadow-Electric-synergies.json',
      ShadowGlacial: 'Shadow-Glacial-synergies.json',
      ShadowInferno: 'Shadow-Inferno-synergies.json',
      ShadowLight: 'Shadow-Light-synergies.json',
      ShadowMage: 'Shadow-Mage-synergies.json',
      ShadowMountain: 'Shadow-Mountain-synergies.json',
      ShadowMystic: 'Shadow-Mystic-synergies.json',
      ShadowOcean: 'Shadow-Ocean-synergies.json',
      ShadowPoison: 'Shadow-Poison-synergies.json',
      ShadowPredator: 'Shadow-Predator-synergies.json',
      ShadowRanger: 'Shadow-Ranger-synergies.json',
      Shadowahadow: 'Shadow-Shadow-synergies.json',
      ShadowSoulbound: 'Shadow-Soulbound-synergies.json',
      ShadowSteel: 'Shadow-Steel-synergies.json',
      ShadowSummoner: 'Shadow-Summoner-synergies.json',
      ShadowWarden: 'Shadow-Warden-synergies.json',
      ShadowWind: 'Shadow-Wind-synergies.json',
      ShadowWoodland: 'Shadow-Woodland-synergies.json',
      ShadowAlchemist: 'Shadow-Alchemist-synergies.json',
    };

    const SYNERGIES = [
      'Alchemist',
      'Mystic',
      'Assassin',
      'Ocean',
      'Avatar',
      'Poison',
      'Berserker',
      'Predator',
      'Blademaster',
      'Ranger',
      'Crystal',
      'Shadow',
      'Desert',
      'Soulbound',
      'Druid',
      'Steel',
      'Electric',
      'Summoner',
      'Glacial',
      'Warden',
      'Inferno',
      'Wind',
      'Light',
      'Woodland',
      'Mage',
      'Mountain',
    ];

    const store = {
      Alchemist: null,
      Alchemist: null,
      Mystic: null,
      Assassin: null,
      Ocean: null,
      Avatar: null,
      Poison: null,
      Berserker: null,
      Predator: null,
      Blademaster: null,
      Ranger: null,
      Crystal: null,
      Shadow: null,
      Desert: null,
      Soulbound: null,
      Druid: null,
      Steel: null,
      Electric: null,
      Summoner: null,
      Glacial: null,
      Warden: null,
      Inferno: null,
      Wind: null,
      Light: null,
      Woodland: null,
      Mage: null,
      Mountain: null,
    };

    async function loadData(synergy) {
      if (store[synergy] === null) {
        const combs = await (await fetch(BASE_URL + DATA_URLS[synergy])).json();
        combs.sort((a, b) => Object.values(b.synergies).reduce((p, c) => p + c) - Object.values(a.synergies).reduce((p, c) => p + c));
        store[synergy] = combs;
      }
      return store[synergy]
    }

    /* src/components/Synergy.svelte generated by Svelte v3.16.3 */

    const file = "src/components/Synergy.svelte";

    // (38:2) {:else}
    function create_else_block(ctx) {
    	let img;
    	let img_src_value;

    	const block = {
    		c: function create() {
    			img = element("img");
    			attr_dev(img, "alt", /*name*/ ctx[0]);
    			if (img.src !== (img_src_value = "https://cdn.lolchess.gg/images/tft/traiticons-darken/trait_icon_" + /*name*/ ctx[0].toLowerCase() + ".png")) attr_dev(img, "src", img_src_value);
    			attr_dev(img, "class", "svelte-1u22alf");
    			add_location(img, file, 38, 4, 752);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, img, anchor);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*name*/ 1) {
    				attr_dev(img, "alt", /*name*/ ctx[0]);
    			}

    			if (dirty & /*name*/ 1 && img.src !== (img_src_value = "https://cdn.lolchess.gg/images/tft/traiticons-darken/trait_icon_" + /*name*/ ctx[0].toLowerCase() + ".png")) {
    				attr_dev(img, "src", img_src_value);
    			}
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(img);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_else_block.name,
    		type: "else",
    		source: "(38:2) {:else}",
    		ctx
    	});

    	return block;
    }

    // (36:2) {#if name.toLowerCase() === 'woodland'}
    function create_if_block(ctx) {
    	let img;
    	let img_src_value;

    	const block = {
    		c: function create() {
    			img = element("img");
    			attr_dev(img, "alt", /*name*/ ctx[0]);
    			if (img.src !== (img_src_value = "https://cdn.lolchess.gg/images/tft/traiticons-darken/trait_icon_forest.png")) attr_dev(img, "src", img_src_value);
    			attr_dev(img, "class", "svelte-1u22alf");
    			add_location(img, file, 36, 4, 638);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, img, anchor);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*name*/ 1) {
    				attr_dev(img, "alt", /*name*/ ctx[0]);
    			}
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(img);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block.name,
    		type: "if",
    		source: "(36:2) {#if name.toLowerCase() === 'woodland'}",
    		ctx
    	});

    	return block;
    }

    function create_fragment(ctx) {
    	let div;
    	let show_if;
    	let div_class_value;

    	function select_block_type(ctx, dirty) {
    		if (show_if == null || dirty & /*name*/ 1) show_if = !!(/*name*/ ctx[0].toLowerCase() === "woodland");
    		if (show_if) return create_if_block;
    		return create_else_block;
    	}

    	let current_block_type = select_block_type(ctx, -1);
    	let if_block = current_block_type(ctx);

    	const block = {
    		c: function create() {
    			div = element("div");
    			if_block.c();

    			attr_dev(div, "class", div_class_value = "synergy " + (/*tier*/ ctx[1] === 3
    			? "tier3"
    			: /*tier*/ ctx[1] === 2 ? "tier2" : "tier1") + " svelte-1u22alf");

    			add_location(div, file, 34, 0, 514);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			if_block.m(div, null);
    		},
    		p: function update(ctx, [dirty]) {
    			if (current_block_type === (current_block_type = select_block_type(ctx, dirty)) && if_block) {
    				if_block.p(ctx, dirty);
    			} else {
    				if_block.d(1);
    				if_block = current_block_type(ctx);

    				if (if_block) {
    					if_block.c();
    					if_block.m(div, null);
    				}
    			}

    			if (dirty & /*tier*/ 2 && div_class_value !== (div_class_value = "synergy " + (/*tier*/ ctx[1] === 3
    			? "tier3"
    			: /*tier*/ ctx[1] === 2 ? "tier2" : "tier1") + " svelte-1u22alf")) {
    				attr_dev(div, "class", div_class_value);
    			}
    		},
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    			if_block.d();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance($$self, $$props, $$invalidate) {
    	let { name } = $$props;
    	let { tier } = $$props;
    	const writable_props = ["name", "tier"];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<Synergy> was created with unknown prop '${key}'`);
    	});

    	$$self.$set = $$props => {
    		if ("name" in $$props) $$invalidate(0, name = $$props.name);
    		if ("tier" in $$props) $$invalidate(1, tier = $$props.tier);
    	};

    	$$self.$capture_state = () => {
    		return { name, tier };
    	};

    	$$self.$inject_state = $$props => {
    		if ("name" in $$props) $$invalidate(0, name = $$props.name);
    		if ("tier" in $$props) $$invalidate(1, tier = $$props.tier);
    	};

    	return [name, tier];
    }

    class Synergy extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance, create_fragment, safe_not_equal, { name: 0, tier: 1 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Synergy",
    			options,
    			id: create_fragment.name
    		});

    		const { ctx } = this.$$;
    		const props = options.props || ({});

    		if (/*name*/ ctx[0] === undefined && !("name" in props)) {
    			console.warn("<Synergy> was created without expected prop 'name'");
    		}

    		if (/*tier*/ ctx[1] === undefined && !("tier" in props)) {
    			console.warn("<Synergy> was created without expected prop 'tier'");
    		}
    	}

    	get name() {
    		throw new Error("<Synergy>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set name(value) {
    		throw new Error("<Synergy>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get tier() {
    		throw new Error("<Synergy>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set tier(value) {
    		throw new Error("<Synergy>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* src/components/SynergyBox.svelte generated by Svelte v3.16.3 */

    const { Object: Object_1 } = globals;
    const file$1 = "src/components/SynergyBox.svelte";

    function get_each_context(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[1] = list[i];
    	return child_ctx;
    }

    // (21:2) {#each Object.keys(synergies) as synergy}
    function create_each_block(ctx) {
    	let current;

    	const synergy = new Synergy({
    			props: {
    				name: /*synergy*/ ctx[1],
    				tier: /*synergies*/ ctx[0][/*synergy*/ ctx[1]]
    			},
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			create_component(synergy.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			mount_component(synergy, target, anchor);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			const synergy_changes = {};
    			if (dirty & /*synergies*/ 1) synergy_changes.name = /*synergy*/ ctx[1];
    			if (dirty & /*synergies*/ 1) synergy_changes.tier = /*synergies*/ ctx[0][/*synergy*/ ctx[1]];
    			synergy.$set(synergy_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(synergy.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(synergy.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(synergy, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block.name,
    		type: "each",
    		source: "(21:2) {#each Object.keys(synergies) as synergy}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$1(ctx) {
    	let div;
    	let current;
    	let each_value = Object.keys(/*synergies*/ ctx[0]);
    	let each_blocks = [];

    	for (let i = 0; i < each_value.length; i += 1) {
    		each_blocks[i] = create_each_block(get_each_context(ctx, each_value, i));
    	}

    	const out = i => transition_out(each_blocks[i], 1, 1, () => {
    		each_blocks[i] = null;
    	});

    	const block = {
    		c: function create() {
    			div = element("div");

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			add_location(div, file$1, 19, 0, 269);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(div, null);
    			}

    			current = true;
    		},
    		p: function update(ctx, [dirty]) {
    			if (dirty & /*Object, synergies*/ 1) {
    				each_value = Object.keys(/*synergies*/ ctx[0]);
    				let i;

    				for (i = 0; i < each_value.length; i += 1) {
    					const child_ctx = get_each_context(ctx, each_value, i);

    					if (each_blocks[i]) {
    						each_blocks[i].p(child_ctx, dirty);
    						transition_in(each_blocks[i], 1);
    					} else {
    						each_blocks[i] = create_each_block(child_ctx);
    						each_blocks[i].c();
    						transition_in(each_blocks[i], 1);
    						each_blocks[i].m(div, null);
    					}
    				}

    				group_outros();

    				for (i = each_value.length; i < each_blocks.length; i += 1) {
    					out(i);
    				}

    				check_outros();
    			}
    		},
    		i: function intro(local) {
    			if (current) return;

    			for (let i = 0; i < each_value.length; i += 1) {
    				transition_in(each_blocks[i]);
    			}

    			current = true;
    		},
    		o: function outro(local) {
    			each_blocks = each_blocks.filter(Boolean);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				transition_out(each_blocks[i]);
    			}

    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    			destroy_each(each_blocks, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$1.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$1($$self, $$props, $$invalidate) {
    	let { synergies } = $$props;
    	const writable_props = ["synergies"];

    	Object_1.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<SynergyBox> was created with unknown prop '${key}'`);
    	});

    	$$self.$set = $$props => {
    		if ("synergies" in $$props) $$invalidate(0, synergies = $$props.synergies);
    	};

    	$$self.$capture_state = () => {
    		return { synergies };
    	};

    	$$self.$inject_state = $$props => {
    		if ("synergies" in $$props) $$invalidate(0, synergies = $$props.synergies);
    	};

    	return [synergies];
    }

    class SynergyBox extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$1, create_fragment$1, safe_not_equal, { synergies: 0 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "SynergyBox",
    			options,
    			id: create_fragment$1.name
    		});

    		const { ctx } = this.$$;
    		const props = options.props || ({});

    		if (/*synergies*/ ctx[0] === undefined && !("synergies" in props)) {
    			console.warn("<SynergyBox> was created without expected prop 'synergies'");
    		}
    	}

    	get synergies() {
    		throw new Error("<SynergyBox>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set synergies(value) {
    		throw new Error("<SynergyBox>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* src/components/Champion.svelte generated by Svelte v3.16.3 */

    const file$2 = "src/components/Champion.svelte";

    function create_fragment$2(ctx) {
    	let div;
    	let img;
    	let img_src_value;

    	const block = {
    		c: function create() {
    			div = element("div");
    			img = element("img");
    			attr_dev(img, "alt", /*name*/ ctx[0]);
    			attr_dev(img, "width", "32");
    			attr_dev(img, "height", "32");
    			if (img.src !== (img_src_value = "http://ddragon.leagueoflegends.com/cdn/9.22.1/img/champion/" + /*name*/ ctx[0] + ".png")) attr_dev(img, "src", img_src_value);
    			attr_dev(img, "class", "svelte-4yuu5d");
    			add_location(img, file$2, 17, 2, 202);
    			attr_dev(div, "class", "champion svelte-4yuu5d");
    			add_location(div, file$2, 16, 0, 177);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			append_dev(div, img);
    		},
    		p: function update(ctx, [dirty]) {
    			if (dirty & /*name*/ 1) {
    				attr_dev(img, "alt", /*name*/ ctx[0]);
    			}

    			if (dirty & /*name*/ 1 && img.src !== (img_src_value = "http://ddragon.leagueoflegends.com/cdn/9.22.1/img/champion/" + /*name*/ ctx[0] + ".png")) {
    				attr_dev(img, "src", img_src_value);
    			}
    		},
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$2.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$2($$self, $$props, $$invalidate) {
    	let { name } = $$props;
    	const writable_props = ["name"];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<Champion> was created with unknown prop '${key}'`);
    	});

    	$$self.$set = $$props => {
    		if ("name" in $$props) $$invalidate(0, name = $$props.name);
    	};

    	$$self.$capture_state = () => {
    		return { name };
    	};

    	$$self.$inject_state = $$props => {
    		if ("name" in $$props) $$invalidate(0, name = $$props.name);
    	};

    	return [name];
    }

    class Champion extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$2, create_fragment$2, safe_not_equal, { name: 0 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Champion",
    			options,
    			id: create_fragment$2.name
    		});

    		const { ctx } = this.$$;
    		const props = options.props || ({});

    		if (/*name*/ ctx[0] === undefined && !("name" in props)) {
    			console.warn("<Champion> was created without expected prop 'name'");
    		}
    	}

    	get name() {
    		throw new Error("<Champion>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set name(value) {
    		throw new Error("<Champion>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* src/components/ChampionBox.svelte generated by Svelte v3.16.3 */
    const file$3 = "src/components/ChampionBox.svelte";

    function get_each_context$1(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[1] = list[i];
    	return child_ctx;
    }

    // (20:2) {#each champions as champion}
    function create_each_block$1(ctx) {
    	let current;

    	const champion = new Champion({
    			props: { name: /*champion*/ ctx[1] },
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			create_component(champion.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			mount_component(champion, target, anchor);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			const champion_changes = {};
    			if (dirty & /*champions*/ 1) champion_changes.name = /*champion*/ ctx[1];
    			champion.$set(champion_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(champion.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(champion.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(champion, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block$1.name,
    		type: "each",
    		source: "(20:2) {#each champions as champion}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$3(ctx) {
    	let div;
    	let current;
    	let each_value = /*champions*/ ctx[0];
    	let each_blocks = [];

    	for (let i = 0; i < each_value.length; i += 1) {
    		each_blocks[i] = create_each_block$1(get_each_context$1(ctx, each_value, i));
    	}

    	const out = i => transition_out(each_blocks[i], 1, 1, () => {
    		each_blocks[i] = null;
    	});

    	const block = {
    		c: function create() {
    			div = element("div");

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			attr_dev(div, "class", "championBox svelte-1q5a3us");
    			add_location(div, file$3, 18, 0, 266);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(div, null);
    			}

    			current = true;
    		},
    		p: function update(ctx, [dirty]) {
    			if (dirty & /*champions*/ 1) {
    				each_value = /*champions*/ ctx[0];
    				let i;

    				for (i = 0; i < each_value.length; i += 1) {
    					const child_ctx = get_each_context$1(ctx, each_value, i);

    					if (each_blocks[i]) {
    						each_blocks[i].p(child_ctx, dirty);
    						transition_in(each_blocks[i], 1);
    					} else {
    						each_blocks[i] = create_each_block$1(child_ctx);
    						each_blocks[i].c();
    						transition_in(each_blocks[i], 1);
    						each_blocks[i].m(div, null);
    					}
    				}

    				group_outros();

    				for (i = each_value.length; i < each_blocks.length; i += 1) {
    					out(i);
    				}

    				check_outros();
    			}
    		},
    		i: function intro(local) {
    			if (current) return;

    			for (let i = 0; i < each_value.length; i += 1) {
    				transition_in(each_blocks[i]);
    			}

    			current = true;
    		},
    		o: function outro(local) {
    			each_blocks = each_blocks.filter(Boolean);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				transition_out(each_blocks[i]);
    			}

    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    			destroy_each(each_blocks, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$3.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$3($$self, $$props, $$invalidate) {
    	let { champions } = $$props;
    	const writable_props = ["champions"];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<ChampionBox> was created with unknown prop '${key}'`);
    	});

    	$$self.$set = $$props => {
    		if ("champions" in $$props) $$invalidate(0, champions = $$props.champions);
    	};

    	$$self.$capture_state = () => {
    		return { champions };
    	};

    	$$self.$inject_state = $$props => {
    		if ("champions" in $$props) $$invalidate(0, champions = $$props.champions);
    	};

    	return [champions];
    }

    class ChampionBox extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$3, create_fragment$3, safe_not_equal, { champions: 0 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "ChampionBox",
    			options,
    			id: create_fragment$3.name
    		});

    		const { ctx } = this.$$;
    		const props = options.props || ({});

    		if (/*champions*/ ctx[0] === undefined && !("champions" in props)) {
    			console.warn("<ChampionBox> was created without expected prop 'champions'");
    		}
    	}

    	get champions() {
    		throw new Error("<ChampionBox>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set champions(value) {
    		throw new Error("<ChampionBox>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* src/components/Filter.svelte generated by Svelte v3.16.3 */
    const file$4 = "src/components/Filter.svelte";

    function create_fragment$4(ctx) {
    	let div;
    	let t;
    	let div_class_value;

    	const block = {
    		c: function create() {
    			div = element("div");
    			t = text(/*name*/ ctx[0]);
    			attr_dev(div, "class", div_class_value = "filter " + (/*isFocus*/ ctx[1] ? "active" : "") + " svelte-1lzfgit");
    			add_location(div, file$4, 35, 0, 564);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			append_dev(div, t);
    		},
    		p: function update(ctx, [dirty]) {
    			if (dirty & /*name*/ 1) set_data_dev(t, /*name*/ ctx[0]);

    			if (dirty & /*isFocus*/ 2 && div_class_value !== (div_class_value = "filter " + (/*isFocus*/ ctx[1] ? "active" : "") + " svelte-1lzfgit")) {
    				attr_dev(div, "class", div_class_value);
    			}
    		},
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$4.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$4($$self, $$props, $$invalidate) {
    	const dispatch = createEventDispatcher();
    	let { name } = $$props;
    	let { isFocus } = $$props;

    	const writable_props = ["name", "isFocus"];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<Filter> was created with unknown prop '${key}'`);
    	});

    	$$self.$set = $$props => {
    		if ("name" in $$props) $$invalidate(0, name = $$props.name);
    		if ("isFocus" in $$props) $$invalidate(1, isFocus = $$props.isFocus);
    	};

    	$$self.$capture_state = () => {
    		return { name, isFocus };
    	};

    	$$self.$inject_state = $$props => {
    		if ("name" in $$props) $$invalidate(0, name = $$props.name);
    		if ("isFocus" in $$props) $$invalidate(1, isFocus = $$props.isFocus);
    	};

    	return [name, isFocus];
    }

    class Filter extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$4, create_fragment$4, safe_not_equal, { name: 0, isFocus: 1 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Filter",
    			options,
    			id: create_fragment$4.name
    		});

    		const { ctx } = this.$$;
    		const props = options.props || ({});

    		if (/*name*/ ctx[0] === undefined && !("name" in props)) {
    			console.warn("<Filter> was created without expected prop 'name'");
    		}

    		if (/*isFocus*/ ctx[1] === undefined && !("isFocus" in props)) {
    			console.warn("<Filter> was created without expected prop 'isFocus'");
    		}
    	}

    	get name() {
    		throw new Error("<Filter>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set name(value) {
    		throw new Error("<Filter>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get isFocus() {
    		throw new Error("<Filter>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set isFocus(value) {
    		throw new Error("<Filter>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* src/components/FilterBox.svelte generated by Svelte v3.16.3 */
    const file$5 = "src/components/FilterBox.svelte";

    function get_each_context$2(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[6] = list[i];
    	child_ctx[8] = i;
    	return child_ctx;
    }

    // (52:2) {#each ['', '', ...names, '', ''] as name, index}
    function create_each_block$2(ctx) {
    	let updating_isFocus;
    	let current;

    	function filter_isFocus_binding(value) {
    		/*filter_isFocus_binding*/ ctx[5].call(null, value, /*index*/ ctx[8]);
    	}

    	let filter_props = { name: /*name*/ ctx[6] };

    	if (/*activeArray*/ ctx[0][/*index*/ ctx[8]] !== void 0) {
    		filter_props.isFocus = /*activeArray*/ ctx[0][/*index*/ ctx[8]];
    	}

    	const filter = new Filter({ props: filter_props, $$inline: true });
    	binding_callbacks.push(() => bind(filter, "isFocus", filter_isFocus_binding));
    	filter.$on("message", /*sender*/ ctx[2]);

    	const block = {
    		c: function create() {
    			create_component(filter.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			mount_component(filter, target, anchor);
    			current = true;
    		},
    		p: function update(new_ctx, dirty) {
    			ctx = new_ctx;
    			const filter_changes = {};
    			if (dirty & /*names*/ 2) filter_changes.name = /*name*/ ctx[6];

    			if (!updating_isFocus && dirty & /*activeArray*/ 1) {
    				updating_isFocus = true;
    				filter_changes.isFocus = /*activeArray*/ ctx[0][/*index*/ ctx[8]];
    				add_flush_callback(() => updating_isFocus = false);
    			}

    			filter.$set(filter_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(filter.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(filter.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(filter, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block$2.name,
    		type: "each",
    		source: "(52:2) {#each ['', '', ...names, '', ''] as name, index}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$5(ctx) {
    	let div;
    	let current;
    	let dispose;
    	let each_value = ["", "", .../*names*/ ctx[1], "", ""];
    	let each_blocks = [];

    	for (let i = 0; i < each_value.length; i += 1) {
    		each_blocks[i] = create_each_block$2(get_each_context$2(ctx, each_value, i));
    	}

    	const out = i => transition_out(each_blocks[i], 1, 1, () => {
    		each_blocks[i] = null;
    	});

    	const block = {
    		c: function create() {
    			div = element("div");

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			attr_dev(div, "id", "filterBox");
    			attr_dev(div, "class", "box svelte-167wy0i");
    			add_location(div, file$5, 50, 0, 974);

    			dispose = [
    				listen_dev(div, "scroll", /*scrollHandler*/ ctx[3], false, false, false),
    				listen_dev(div, "mousedown", mousedownHandler, false, false, false)
    			];
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(div, null);
    			}

    			current = true;
    		},
    		p: function update(ctx, [dirty]) {
    			if (dirty & /*names, activeArray, sender*/ 7) {
    				each_value = ["", "", .../*names*/ ctx[1], "", ""];
    				let i;

    				for (i = 0; i < each_value.length; i += 1) {
    					const child_ctx = get_each_context$2(ctx, each_value, i);

    					if (each_blocks[i]) {
    						each_blocks[i].p(child_ctx, dirty);
    						transition_in(each_blocks[i], 1);
    					} else {
    						each_blocks[i] = create_each_block$2(child_ctx);
    						each_blocks[i].c();
    						transition_in(each_blocks[i], 1);
    						each_blocks[i].m(div, null);
    					}
    				}

    				group_outros();

    				for (i = each_value.length; i < each_blocks.length; i += 1) {
    					out(i);
    				}

    				check_outros();
    			}
    		},
    		i: function intro(local) {
    			if (current) return;

    			for (let i = 0; i < each_value.length; i += 1) {
    				transition_in(each_blocks[i]);
    			}

    			current = true;
    		},
    		o: function outro(local) {
    			each_blocks = each_blocks.filter(Boolean);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				transition_out(each_blocks[i]);
    			}

    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    			destroy_each(each_blocks, detaching);
    			run_all(dispose);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$5.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function mousedownHandler(a) {
    	
    }

    function instance$5($$self, $$props, $$invalidate) {
    	const dispatch = createEventDispatcher();
    	let { names } = $$props;
    	let { activeArray = names.map(name => false) } = $$props;
    	activeArray[2] = true;

    	function sender(event) {
    		dispatch("message", { data: event.detail.data });
    	}

    	function scrollHandler(event) {
    		const w = document.getElementById("filterBox").clientWidth / 5;
    		const target = Math.round(event.target.scrollLeft / w) + 2;

    		if (!target) {
    			return;
    		}

    		$$invalidate(0, activeArray = activeArray.map(x => false));
    		$$invalidate(0, activeArray[target] = true, activeArray);
    		dispatch("message", { data: names[target] });
    	}

    	const writable_props = ["names", "activeArray"];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<FilterBox> was created with unknown prop '${key}'`);
    	});

    	function filter_isFocus_binding(value, index) {
    		activeArray[index] = value;
    		$$invalidate(0, activeArray);
    	}

    	$$self.$set = $$props => {
    		if ("names" in $$props) $$invalidate(1, names = $$props.names);
    		if ("activeArray" in $$props) $$invalidate(0, activeArray = $$props.activeArray);
    	};

    	$$self.$capture_state = () => {
    		return { names, activeArray };
    	};

    	$$self.$inject_state = $$props => {
    		if ("names" in $$props) $$invalidate(1, names = $$props.names);
    		if ("activeArray" in $$props) $$invalidate(0, activeArray = $$props.activeArray);
    	};

    	return [activeArray, names, sender, scrollHandler, dispatch, filter_isFocus_binding];
    }

    class FilterBox extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$5, create_fragment$5, safe_not_equal, { names: 1, activeArray: 0 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "FilterBox",
    			options,
    			id: create_fragment$5.name
    		});

    		const { ctx } = this.$$;
    		const props = options.props || ({});

    		if (/*names*/ ctx[1] === undefined && !("names" in props)) {
    			console.warn("<FilterBox> was created without expected prop 'names'");
    		}
    	}

    	get names() {
    		throw new Error("<FilterBox>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set names(value) {
    		throw new Error("<FilterBox>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get activeArray() {
    		throw new Error("<FilterBox>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set activeArray(value) {
    		throw new Error("<FilterBox>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* src/App.svelte generated by Svelte v3.16.3 */

    const { Object: Object_1$1, window: window_1 } = globals;
    const file$6 = "src/App.svelte";

    function get_each_context$3(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[2] = list[i];
    	child_ctx[11] = i;
    	return child_ctx;
    }

    // (72:2) {#each combinations as synergy, index}
    function create_each_block$3(ctx) {
    	let div2;
    	let div0;
    	let div0_style_value;
    	let t0;
    	let div1;
    	let t1;
    	let current;

    	const synergybox = new SynergyBox({
    			props: { synergies: /*synergy*/ ctx[2].synergies },
    			$$inline: true
    		});

    	const championbox = new ChampionBox({
    			props: { champions: /*synergy*/ ctx[2].champions },
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			div2 = element("div");
    			div0 = element("div");
    			create_component(synergybox.$$.fragment);
    			t0 = space();
    			div1 = element("div");
    			create_component(championbox.$$.fragment);
    			t1 = space();
    			attr_dev(div0, "class", "synergy svelte-pp7uqn");

    			attr_dev(div0, "style", div0_style_value = Object.keys(/*synergy*/ ctx[2].synergies).length < 3
    			? "bottom:20px;"
    			: "");

    			add_location(div0, file$6, 74, 3, 2376);
    			attr_dev(div1, "class", "champions svelte-pp7uqn");
    			add_location(div1, file$6, 77, 3, 2531);
    			attr_dev(div2, "class", "line svelte-pp7uqn");
    			add_location(div2, file$6, 72, 2, 2292);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div2, anchor);
    			append_dev(div2, div0);
    			mount_component(synergybox, div0, null);
    			append_dev(div2, t0);
    			append_dev(div2, div1);
    			mount_component(championbox, div1, null);
    			append_dev(div2, t1);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			const synergybox_changes = {};
    			if (dirty & /*combinations*/ 1) synergybox_changes.synergies = /*synergy*/ ctx[2].synergies;
    			synergybox.$set(synergybox_changes);

    			if (!current || dirty & /*combinations*/ 1 && div0_style_value !== (div0_style_value = Object.keys(/*synergy*/ ctx[2].synergies).length < 3
    			? "bottom:20px;"
    			: "")) {
    				attr_dev(div0, "style", div0_style_value);
    			}

    			const championbox_changes = {};
    			if (dirty & /*combinations*/ 1) championbox_changes.champions = /*synergy*/ ctx[2].champions;
    			championbox.$set(championbox_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(synergybox.$$.fragment, local);
    			transition_in(championbox.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(synergybox.$$.fragment, local);
    			transition_out(championbox.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div2);
    			destroy_component(synergybox);
    			destroy_component(championbox);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block$3.name,
    		type: "each",
    		source: "(72:2) {#each combinations as synergy, index}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$6(ctx) {
    	let link0;
    	let link1;
    	let meta;
    	let t0;
    	let main;
    	let div0;
    	let t2;
    	let t3;
    	let div1;
    	let t4;
    	let t5;
    	let t6;
    	let t7;
    	let div2;
    	let t8;
    	let p;
    	let current;
    	let dispose;

    	const filterbox = new FilterBox({
    			props: { names: SYNERGIES },
    			$$inline: true
    		});

    	filterbox.$on("message", /*handleMessage*/ ctx[3]);
    	let each_value = /*combinations*/ ctx[0];
    	let each_blocks = [];

    	for (let i = 0; i < each_value.length; i += 1) {
    		each_blocks[i] = create_each_block$3(get_each_context$3(ctx, each_value, i));
    	}

    	const out = i => transition_out(each_blocks[i], 1, 1, () => {
    		each_blocks[i] = null;
    	});

    	const block = {
    		c: function create() {
    			link0 = element("link");
    			link1 = element("link");
    			meta = element("meta");
    			t0 = space();
    			main = element("main");
    			div0 = element("div");
    			div0.textContent = "Light";
    			t2 = space();
    			create_component(filterbox.$$.fragment);
    			t3 = space();
    			div1 = element("div");
    			t4 = text("총 ");
    			t5 = text(/*currentCombinationsLength*/ ctx[1]);
    			t6 = text("개");
    			t7 = space();
    			div2 = element("div");

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			t8 = space();
    			p = element("p");
    			p.textContent = "Contact : soronto3603@gmail.com";
    			attr_dev(link0, "href", "https://fonts.googleapis.com/css?family=Noto+Sans+KR&display=swap");
    			attr_dev(link0, "rel", "stylesheet");
    			add_location(link0, file$6, 3, 1, 241);
    			attr_dev(link1, "href", "https://fonts.googleapis.com/css?family=Girassol&display=swap");
    			attr_dev(link1, "rel", "stylesheet");
    			add_location(link1, file$6, 4, 1, 339);
    			attr_dev(meta, "name", "viewport");
    			attr_dev(meta, "content", "width=device-width, user-scalable=no");
    			add_location(meta, file$6, 5, 1, 433);
    			attr_dev(div0, "class", "synergyTitle svelte-pp7uqn");
    			add_location(div0, file$6, 67, 1, 2061);
    			attr_dev(div1, "class", "numberDescription svelte-pp7uqn");
    			add_location(div1, file$6, 69, 1, 2160);
    			attr_dev(div2, "class", "table");
    			add_location(div2, file$6, 70, 1, 2229);
    			add_location(p, file$6, 85, 1, 2759);
    			attr_dev(main, "class", "svelte-pp7uqn");
    			add_location(main, file$6, 66, 0, 2053);
    			dispose = listen_dev(window_1, "scroll", /*onScrollHandler*/ ctx[4], false, false, false);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			append_dev(document.head, link0);
    			append_dev(document.head, link1);
    			append_dev(document.head, meta);
    			insert_dev(target, t0, anchor);
    			insert_dev(target, main, anchor);
    			append_dev(main, div0);
    			append_dev(main, t2);
    			mount_component(filterbox, main, null);
    			append_dev(main, t3);
    			append_dev(main, div1);
    			append_dev(div1, t4);
    			append_dev(div1, t5);
    			append_dev(div1, t6);
    			append_dev(main, t7);
    			append_dev(main, div2);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(div2, null);
    			}

    			append_dev(main, t8);
    			append_dev(main, p);
    			current = true;
    		},
    		p: function update(ctx, [dirty]) {
    			if (!current || dirty & /*currentCombinationsLength*/ 2) set_data_dev(t5, /*currentCombinationsLength*/ ctx[1]);

    			if (dirty & /*combinations, Object*/ 1) {
    				each_value = /*combinations*/ ctx[0];
    				let i;

    				for (i = 0; i < each_value.length; i += 1) {
    					const child_ctx = get_each_context$3(ctx, each_value, i);

    					if (each_blocks[i]) {
    						each_blocks[i].p(child_ctx, dirty);
    						transition_in(each_blocks[i], 1);
    					} else {
    						each_blocks[i] = create_each_block$3(child_ctx);
    						each_blocks[i].c();
    						transition_in(each_blocks[i], 1);
    						each_blocks[i].m(div2, null);
    					}
    				}

    				group_outros();

    				for (i = each_value.length; i < each_blocks.length; i += 1) {
    					out(i);
    				}

    				check_outros();
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(filterbox.$$.fragment, local);

    			for (let i = 0; i < each_value.length; i += 1) {
    				transition_in(each_blocks[i]);
    			}

    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(filterbox.$$.fragment, local);
    			each_blocks = each_blocks.filter(Boolean);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				transition_out(each_blocks[i]);
    			}

    			current = false;
    		},
    		d: function destroy(detaching) {
    			detach_dev(link0);
    			detach_dev(link1);
    			detach_dev(meta);
    			if (detaching) detach_dev(t0);
    			if (detaching) detach_dev(main);
    			destroy_component(filterbox);
    			destroy_each(each_blocks, detaching);
    			dispose();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$6.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    const offset = 20;
    const PRINCIPAL = "Light";

    function instance$6($$self, $$props, $$invalidate) {
    	let { combinations = [] } = $$props;
    	let { currentCombinationsLength } = $$props;
    	let { synergy } = $$props;
    	let { page = 0 } = $$props;

    	onMount(async () => {
    		$$invalidate(2, synergy = "Alchemist");
    		reload();
    	});

    	async function handleMessage(event) {
    		$$invalidate(2, synergy = event.detail.data);
    		$$invalidate(5, page = 0);
    		reload();
    	}

    	async function reload() {
    		$$invalidate(0, combinations = [...(await loadData(PRINCIPAL + synergy)).slice(0, offset * page + offset)]);
    		$$invalidate(1, currentCombinationsLength = (await loadData(synergy)).length);
    	}

    	async function onScrollHandler(event) {
    		const top = event.target.scrollingElement.scrollTop;
    		const height = event.target.scrollingElement.scrollHeight;
    		const windowHeight = window.screen.height;

    		if ((top + windowHeight) / height > 0.9) {
    			$$invalidate(5, page += 1);
    			await reload();
    		}
    	}

    	const writable_props = ["combinations", "currentCombinationsLength", "synergy", "page"];

    	Object_1$1.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<App> was created with unknown prop '${key}'`);
    	});

    	$$self.$set = $$props => {
    		if ("combinations" in $$props) $$invalidate(0, combinations = $$props.combinations);
    		if ("currentCombinationsLength" in $$props) $$invalidate(1, currentCombinationsLength = $$props.currentCombinationsLength);
    		if ("synergy" in $$props) $$invalidate(2, synergy = $$props.synergy);
    		if ("page" in $$props) $$invalidate(5, page = $$props.page);
    	};

    	$$self.$capture_state = () => {
    		return {
    			combinations,
    			currentCombinationsLength,
    			synergy,
    			page
    		};
    	};

    	$$self.$inject_state = $$props => {
    		if ("combinations" in $$props) $$invalidate(0, combinations = $$props.combinations);
    		if ("currentCombinationsLength" in $$props) $$invalidate(1, currentCombinationsLength = $$props.currentCombinationsLength);
    		if ("synergy" in $$props) $$invalidate(2, synergy = $$props.synergy);
    		if ("page" in $$props) $$invalidate(5, page = $$props.page);
    	};

    	return [
    		combinations,
    		currentCombinationsLength,
    		synergy,
    		handleMessage,
    		onScrollHandler,
    		page
    	];
    }

    class App extends SvelteComponentDev {
    	constructor(options) {
    		super(options);

    		init(this, options, instance$6, create_fragment$6, safe_not_equal, {
    			combinations: 0,
    			currentCombinationsLength: 1,
    			synergy: 2,
    			page: 5
    		});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "App",
    			options,
    			id: create_fragment$6.name
    		});

    		const { ctx } = this.$$;
    		const props = options.props || ({});

    		if (/*currentCombinationsLength*/ ctx[1] === undefined && !("currentCombinationsLength" in props)) {
    			console.warn("<App> was created without expected prop 'currentCombinationsLength'");
    		}

    		if (/*synergy*/ ctx[2] === undefined && !("synergy" in props)) {
    			console.warn("<App> was created without expected prop 'synergy'");
    		}
    	}

    	get combinations() {
    		throw new Error("<App>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set combinations(value) {
    		throw new Error("<App>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get currentCombinationsLength() {
    		throw new Error("<App>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set currentCombinationsLength(value) {
    		throw new Error("<App>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get synergy() {
    		throw new Error("<App>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set synergy(value) {
    		throw new Error("<App>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get page() {
    		throw new Error("<App>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set page(value) {
    		throw new Error("<App>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    const app = new App({
    	target: document.body,
    	props: {
    		// name: 'world'
    	}
    });

    return app;

}());
//# sourceMappingURL=bundle.js.map
