module.exports = {
    "nTimes": (opts = {hash: {}}) => {


        let {
                min     = 0,
                max     = 3,
                empty   = "false",
                prefix  = "",
                postfix = "",
                joiner  = "",

            } = opts.hash || {};

        max = parseInt(max);
        min = parseInt(min);

        function rangeElement(i) {
            return {
                i        : i,
                prefixed : prefix + i,
                postfixed: i + postfix,
                wrapped  : prefix + i + postfix
            };
        }

        function range(min, max, empty) {
            let o = [], es = empty ? empty.toString() : "";
            for (let i = min; i <= max; ++i) {
                let ii = i.toString();
                o.push(rangeElement( ii === es ? "" : ii));
            }
            return o;
        }

        function ranges(min, max, empty) {
            return range(min, max, -1)
                .map(({i}) => ({
                    current : i.toString() === empty.toString() ? "" : i,
                    elements: range(min, i, empty)
                }));
        }

        function rangesMap(fn) {
            return ranges(min, max, empty.toString()).map(fn).join(joiner);
        }

        if ((min <= 0 || max < 0 || min > max) && opts.inverse) {
            return opts.inverse(this);
        }

        if (opts.fn) {
            return rangesMap(opts.fn);
        }

        return rangesMap(v => v.map(vv => vv.wrapped));

    }

};
