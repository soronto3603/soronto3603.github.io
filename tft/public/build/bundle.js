
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
      Alchemist: 'Light-Alchemist-synergies.json',
      Mystic: 'Light-Mystic-synergies.json',
      Assassin: 'Light-Assassin-synergies.json',
      Ocean: 'Light-Ocean-synergies.json',
      Avatar: 'Light-Avatar-synergies.json',
      Poison: 'Light-Poison-synergies.json',
      Berserker: 'Light-Berserker-synergies.json',
      Predator: 'Light-Predator-synergies.json',
      Blademaster: 'Light-Blademaster-synergies.json ',
      Ranger: 'Light-Ranger-synergies.json',
      Crystal: 'Light-Crystal-synergies.json',
      Shadow: 'Light-Shadow-synergies.json',
      Desert: 'Light-Desert-synergies.json',
      Soulbound: 'Light-Soulbound-synergies.json',
      Druid: 'Light-Druid-synergies.json',
      Steel: 'Light-Steel-synergies.json',
      Electric: 'Light-Electric-synergies.json',
      Summoner: 'Light-Summoner-synergies.json',
      Glacial: 'Light-Glacial-synergies.json',
      Warden: 'Light-Warden-synergies.json',
      Inferno: 'Light-Inferno-synergies.json',
      Wind: 'Light-Wind-synergies.json',
      Light: 'Light-Light-synergies.json',
      Woodland: 'Light-Woodland-synergies.json',
      Mage: 'Light-Mage-synergies.json',
      Mountain: 'Light-Mountain-synergies.json',
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
    			attr_dev(img, "class", "svelte-11ii4ob");
    			add_location(img, file, 38, 4, 749);
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
    			attr_dev(img, "class", "svelte-11ii4ob");
    			add_location(img, file, 36, 4, 635);
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
    			: /*tier*/ ctx[1] === 2 ? "tier2" : "tier1") + " svelte-11ii4ob");

    			add_location(div, file, 34, 0, 511);
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
    			: /*tier*/ ctx[1] === 2 ? "tier2" : "tier1") + " svelte-11ii4ob")) {
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

    // (17:2) {#each Object.keys(synergies) as synergy}
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
    		source: "(17:2) {#each Object.keys(synergies) as synergy}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$1(ctx) {
    	let div1;
    	let t0;
    	let div0;
    	let t1_value = Object.keys(/*synergies*/ ctx[0]).length + "";
    	let t1;
    	let t2;
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
    			div1 = element("div");

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			t0 = space();
    			div0 = element("div");
    			t1 = text(t1_value);
    			t2 = text("개");
    			attr_dev(div0, "class", "length svelte-252hde");
    			add_location(div0, file$1, 19, 2, 339);
    			add_location(div1, file$1, 15, 0, 220);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div1, anchor);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(div1, null);
    			}

    			append_dev(div1, t0);
    			append_dev(div1, div0);
    			append_dev(div0, t1);
    			append_dev(div0, t2);
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
    						each_blocks[i].m(div1, t0);
    					}
    				}

    				group_outros();

    				for (i = each_value.length; i < each_blocks.length; i += 1) {
    					out(i);
    				}

    				check_outros();
    			}

    			if ((!current || dirty & /*synergies*/ 1) && t1_value !== (t1_value = Object.keys(/*synergies*/ ctx[0]).length + "")) set_data_dev(t1, t1_value);
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
    			if (detaching) detach_dev(div1);
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
    			attr_dev(img, "class", "svelte-1v0688r");
    			add_location(img, file$2, 16, 2, 185);
    			attr_dev(div, "class", "champion svelte-1v0688r");
    			add_location(div, file$2, 15, 0, 160);
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
    	let div1;
    	let t0;
    	let div0;
    	let t1_value = /*champions*/ ctx[0].length + "";
    	let t1;
    	let t2;
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
    			div1 = element("div");

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			t0 = space();
    			div0 = element("div");
    			t1 = text(t1_value);
    			t2 = text("개");
    			attr_dev(div0, "class", "length svelte-1q5a3us");
    			add_location(div0, file$3, 22, 2, 369);
    			attr_dev(div1, "class", "championBox svelte-1q5a3us");
    			add_location(div1, file$3, 18, 0, 266);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div1, anchor);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(div1, null);
    			}

    			append_dev(div1, t0);
    			append_dev(div1, div0);
    			append_dev(div0, t1);
    			append_dev(div0, t2);
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
    						each_blocks[i].m(div1, t0);
    					}
    				}

    				group_outros();

    				for (i = each_value.length; i < each_blocks.length; i += 1) {
    					out(i);
    				}

    				check_outros();
    			}

    			if ((!current || dirty & /*champions*/ 1) && t1_value !== (t1_value = /*champions*/ ctx[0].length + "")) set_data_dev(t1, t1_value);
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
    			if (detaching) detach_dev(div1);
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
    	let dispose;

    	const block = {
    		c: function create() {
    			div = element("div");
    			t = text(/*name*/ ctx[0]);
    			attr_dev(div, "class", div_class_value = "filter " + (/*isFocus*/ ctx[1] ? "active" : "") + " svelte-xjegwq");
    			add_location(div, file$4, 35, 0, 530);
    			dispose = listen_dev(div, "click", /*message*/ ctx[2], false, false, false);
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

    			if (dirty & /*isFocus*/ 2 && div_class_value !== (div_class_value = "filter " + (/*isFocus*/ ctx[1] ? "active" : "") + " svelte-xjegwq")) {
    				attr_dev(div, "class", div_class_value);
    			}
    		},
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    			dispose();
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

    	function message() {
    		dispatch("message", { data: name });
    	}

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

    	return [name, isFocus, message];
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
    	child_ctx[5] = list[i];
    	return child_ctx;
    }

    // (37:2) {#each names as name}
    function create_each_block$2(ctx) {
    	let current;

    	const filter = new Filter({
    			props: {
    				name: /*name*/ ctx[5],
    				isFocus: /*activeArray*/ ctx[0][/*name*/ ctx[5]]
    			},
    			$$inline: true
    		});

    	filter.$on("message", /*sender*/ ctx[2]);

    	const block = {
    		c: function create() {
    			create_component(filter.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			mount_component(filter, target, anchor);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			const filter_changes = {};
    			if (dirty & /*names*/ 2) filter_changes.name = /*name*/ ctx[5];
    			if (dirty & /*activeArray, names*/ 3) filter_changes.isFocus = /*activeArray*/ ctx[0][/*name*/ ctx[5]];
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
    		source: "(37:2) {#each names as name}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$5(ctx) {
    	let div;
    	let current;
    	let each_value = /*names*/ ctx[1];
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

    			attr_dev(div, "class", "filterBox svelte-1a07nrb");
    			add_location(div, file$5, 35, 0, 627);
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
    				each_value = /*names*/ ctx[1];
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

    function instance$5($$self, $$props, $$invalidate) {
    	const dispatch = createEventDispatcher();
    	let { names } = $$props;

    	const activeArray = names.reduce(
    		(p, c) => {
    			p[c] = false;
    			return p;
    		},
    		{}
    	);

    	function sender(event) {
    		focus(event.detail.data);
    		dispatch("message", { data: event.detail.data });
    	}

    	function focus(focusName) {
    		for (const name of names) {
    			$$invalidate(0, activeArray[name] = false, activeArray);
    		}

    		$$invalidate(0, activeArray[focusName] = true, activeArray);
    	}

    	const writable_props = ["names"];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<FilterBox> was created with unknown prop '${key}'`);
    	});

    	$$self.$set = $$props => {
    		if ("names" in $$props) $$invalidate(1, names = $$props.names);
    	};

    	$$self.$capture_state = () => {
    		return { names };
    	};

    	$$self.$inject_state = $$props => {
    		if ("names" in $$props) $$invalidate(1, names = $$props.names);
    	};

    	return [activeArray, names, sender];
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
    		return this.$$.ctx[0];
    	}

    	set activeArray(value) {
    		throw new Error("<FilterBox>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* src/App.svelte generated by Svelte v3.16.3 */
    const file$6 = "src/App.svelte";

    function get_each_context$3(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[3] = list[i];
    	child_ctx[10] = i;
    	return child_ctx;
    }

    // (54:2) {#each combinations as synergy, index}
    function create_each_block$3(ctx) {
    	let div3;
    	let div0;
    	let t0_value = /*page*/ ctx[2] * 100 + /*index*/ ctx[10] + 1 + "";
    	let t0;
    	let t1;
    	let div1;
    	let t2;
    	let div2;
    	let current;

    	const synergybox = new SynergyBox({
    			props: { synergies: /*synergy*/ ctx[3].synergies },
    			$$inline: true
    		});

    	const championbox = new ChampionBox({
    			props: { champions: /*synergy*/ ctx[3].champions },
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			div3 = element("div");
    			div0 = element("div");
    			t0 = text(t0_value);
    			t1 = space();
    			div1 = element("div");
    			create_component(synergybox.$$.fragment);
    			t2 = space();
    			div2 = element("div");
    			create_component(championbox.$$.fragment);
    			attr_dev(div0, "class", "index svelte-13adqcf");
    			add_location(div0, file$6, 55, 3, 1390);
    			attr_dev(div1, "class", "synergy svelte-13adqcf");
    			add_location(div1, file$6, 56, 3, 1443);
    			attr_dev(div2, "class", "champions svelte-13adqcf");
    			add_location(div2, file$6, 59, 3, 1527);
    			attr_dev(div3, "class", "line svelte-13adqcf");
    			add_location(div3, file$6, 54, 2, 1368);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div3, anchor);
    			append_dev(div3, div0);
    			append_dev(div0, t0);
    			append_dev(div3, t1);
    			append_dev(div3, div1);
    			mount_component(synergybox, div1, null);
    			append_dev(div3, t2);
    			append_dev(div3, div2);
    			mount_component(championbox, div2, null);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			if ((!current || dirty & /*page*/ 4) && t0_value !== (t0_value = /*page*/ ctx[2] * 100 + /*index*/ ctx[10] + 1 + "")) set_data_dev(t0, t0_value);
    			const synergybox_changes = {};
    			if (dirty & /*combinations*/ 1) synergybox_changes.synergies = /*synergy*/ ctx[3].synergies;
    			synergybox.$set(synergybox_changes);
    			const championbox_changes = {};
    			if (dirty & /*combinations*/ 1) championbox_changes.champions = /*synergy*/ ctx[3].champions;
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
    			if (detaching) detach_dev(div3);
    			destroy_component(synergybox);
    			destroy_component(championbox);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block$3.name,
    		type: "each",
    		source: "(54:2) {#each combinations as synergy, index}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$6(ctx) {
    	let link;
    	let t0;
    	let main;
    	let t1;
    	let div0;
    	let t2;
    	let t3;
    	let t4;
    	let div1;
    	let t5;
    	let t6;
    	let t7;
    	let t8;
    	let div4;
    	let t9;
    	let div2;
    	let t11;
    	let div3;
    	let t13;
    	let p;
    	let current;
    	let dispose;

    	const filterbox = new FilterBox({
    			props: { names: SYNERGIES },
    			$$inline: true
    		});

    	filterbox.$on("message", /*handleMessage*/ ctx[4]);
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
    			link = element("link");
    			t0 = space();
    			main = element("main");
    			create_component(filterbox.$$.fragment);
    			t1 = space();
    			div0 = element("div");
    			t2 = text("6Light + ");
    			t3 = text(/*synergy*/ ctx[3]);
    			t4 = space();
    			div1 = element("div");
    			t5 = text("총 ");
    			t6 = text(/*currentCombinationsLength*/ ctx[1]);
    			t7 = text("개");
    			t8 = space();
    			div4 = element("div");

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			t9 = space();
    			div2 = element("div");
    			div2.textContent = "←";
    			t11 = space();
    			div3 = element("div");
    			div3.textContent = "→";
    			t13 = space();
    			p = element("p");
    			p.textContent = "Contact : soronto3603@gmail.com";
    			attr_dev(link, "href", "https://fonts.googleapis.com/css?family=Noto+Sans+KR&display=swap");
    			attr_dev(link, "rel", "stylesheet");
    			add_location(link, file$6, 46, 0, 1044);
    			attr_dev(div0, "class", "synergyTitle svelte-13adqcf");
    			add_location(div0, file$6, 50, 1, 1210);
    			add_location(div1, file$6, 51, 1, 1262);
    			attr_dev(div2, "class", "arrow left svelte-13adqcf");
    			add_location(div2, file$6, 64, 2, 1632);
    			attr_dev(div3, "class", "arrow right svelte-13adqcf");
    			add_location(div3, file$6, 65, 2, 1686);
    			attr_dev(div4, "class", "table svelte-13adqcf");
    			add_location(div4, file$6, 52, 1, 1305);
    			add_location(p, file$6, 67, 1, 1748);
    			attr_dev(main, "class", "svelte-13adqcf");
    			add_location(main, file$6, 48, 0, 1142);

    			dispose = [
    				listen_dev(div2, "click", /*prevPage*/ ctx[6], false, false, false),
    				listen_dev(div3, "click", /*nextPage*/ ctx[5], false, false, false)
    			];
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, link, anchor);
    			insert_dev(target, t0, anchor);
    			insert_dev(target, main, anchor);
    			mount_component(filterbox, main, null);
    			append_dev(main, t1);
    			append_dev(main, div0);
    			append_dev(div0, t2);
    			append_dev(div0, t3);
    			append_dev(main, t4);
    			append_dev(main, div1);
    			append_dev(div1, t5);
    			append_dev(div1, t6);
    			append_dev(div1, t7);
    			append_dev(main, t8);
    			append_dev(main, div4);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(div4, null);
    			}

    			append_dev(div4, t9);
    			append_dev(div4, div2);
    			append_dev(div4, t11);
    			append_dev(div4, div3);
    			append_dev(main, t13);
    			append_dev(main, p);
    			current = true;
    		},
    		p: function update(ctx, [dirty]) {
    			if (!current || dirty & /*synergy*/ 8) set_data_dev(t3, /*synergy*/ ctx[3]);
    			if (!current || dirty & /*currentCombinationsLength*/ 2) set_data_dev(t6, /*currentCombinationsLength*/ ctx[1]);

    			if (dirty & /*combinations, page*/ 5) {
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
    						each_blocks[i].m(div4, t9);
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
    			if (detaching) detach_dev(link);
    			if (detaching) detach_dev(t0);
    			if (detaching) detach_dev(main);
    			destroy_component(filterbox);
    			destroy_each(each_blocks, detaching);
    			run_all(dispose);
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

    function instance$6($$self, $$props, $$invalidate) {
    	let { combinations = [] } = $$props;
    	let { currentCombinationsLength } = $$props;
    	let { synergy } = $$props;
    	let { page = 0 } = $$props;

    	onMount(async () => {
    		$$invalidate(3, synergy = "Predator");
    		reload();
    	});

    	async function handleMessage(event) {
    		$$invalidate(3, synergy = event.detail.data);
    		$$invalidate(2, page = 0);
    		reload();
    	}

    	async function nextPage() {
    		if ((page + 1) * 100 < currentCombinationsLength) {
    			$$invalidate(2, page += 1);
    			reload();
    		}
    	}

    	async function prevPage() {
    		if (page !== 0) {
    			$$invalidate(2, page -= 1);
    			reload();
    		}
    	}

    	async function reload() {
    		$$invalidate(0, combinations = [...(await loadData(synergy)).slice(100 * page, 100 * page + 100)]);
    		$$invalidate(1, currentCombinationsLength = (await loadData(synergy)).length);
    	}

    	const writable_props = ["combinations", "currentCombinationsLength", "synergy", "page"];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<App> was created with unknown prop '${key}'`);
    	});

    	$$self.$set = $$props => {
    		if ("combinations" in $$props) $$invalidate(0, combinations = $$props.combinations);
    		if ("currentCombinationsLength" in $$props) $$invalidate(1, currentCombinationsLength = $$props.currentCombinationsLength);
    		if ("synergy" in $$props) $$invalidate(3, synergy = $$props.synergy);
    		if ("page" in $$props) $$invalidate(2, page = $$props.page);
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
    		if ("synergy" in $$props) $$invalidate(3, synergy = $$props.synergy);
    		if ("page" in $$props) $$invalidate(2, page = $$props.page);
    	};

    	return [
    		combinations,
    		currentCombinationsLength,
    		page,
    		synergy,
    		handleMessage,
    		nextPage,
    		prevPage
    	];
    }

    class App extends SvelteComponentDev {
    	constructor(options) {
    		super(options);

    		init(this, options, instance$6, create_fragment$6, safe_not_equal, {
    			combinations: 0,
    			currentCombinationsLength: 1,
    			synergy: 3,
    			page: 2
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

    		if (/*synergy*/ ctx[3] === undefined && !("synergy" in props)) {
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
