var checks = new g.Collection('id');
var nodes = new g.Collection('name');
var agents = new g.Collection('name');
var evaluations = new g.Collection('CheckID');
var checkresults = new g.Collection('check_id');

var listChecks = Vue.component('list-checks', {
    data: function() {
        return {
            checks: checks
        };
    },

    methods: {
        deleteCheck: function(button, id) {
            button.disabled = true;

            Vue.http.delete('/api/checks/' + id);
        },

        editCheck: function(id) {
            router.push('/check/edit/' + id);
        },

        viewCheck: function(id) {
            router.push('/check/view/' + id);
        }
    },

    template: '#template-checks'
});

var listNodes = Vue.component('list-nodes', {
    data: function() {
        return {
            nodes: nodes
        };
    },

    template: '#template-nodes'
});

var editCheck = Vue.component('edit-check', {
    data: function() {
        return {
            title: 'Add check',
            agents: agents.data,
            check: {
                interval: 30,
                arguments: {},
                agent: 'http',
                id: '',
                expressions: []
            },
            results: {results: {}},
        };
    },

    created: function() {
        // fetch the data when the view is created and the data is
        // already being observed
        this.fetchData();
    },

    watch: {
        '$route': 'fetchData'
    },

    methods: {
        addExpression: function() {
            this.check.expressions.push('');
        },

        removeExpression: function(index) {
            this.check.expressions.splice(index, 1);
        },

        fetchData: function() {
            var check = checks.get(this.$route.params.id);

            if (check != undefined) {
                check.interval /= 1000000000;
                this.title = "Edit " + this.$route.params.id;
                this.check = check;
            }
        },

        testCheck: function() {
            this.$http.post('/api/test', this.check).then(function(response) {
                this.results = response.body;
            });
        },

        addCheck: function() {
            this.check.interval *= 1000000000;
            this.$http.post('/api/checks', this.check).then(function(response) {
                router.push('/checks');
            });
        }
    },

    computed: {
        arguments: function() {
            var agentId = this.check.agent;
            var agent = agents.get(agentId);

            return agent.arguments;
        }
    },

    template: '#template-edit-check'
});

var viewCheck = Vue.component('view-check', {
    data: function() {
        return {
            checks: checks,
            evaluations: evaluations,
            checkresults: checkresults,
        };
    },

    computed: {
        id: function() {
            return this.$route.params.id;
        },

        check: function() {
            return checks.get(this.$route.params.id);
        },

        evaluation: function() {
            return evaluations.get(this.$route.params.id);
        },

        result: function() {
            var result = checkresults.get(this.$route.params.id);

            if (!result) {
                // Present an "empty" object to satisfy template requirements.
                return {
                    error: null,
                    results: []
                };
            }

            return result;
        }
    },

    template: '#template-view-check'
});

var init = g.waitGroup(function() {
    g.live();

    const app = new Vue({
        el: '#app',
        router: router
    });
});

Vue.http.get('/api/agents').then(function(response) {
    init.add(1);
    response.body.forEach(function(check) {
        agents.upsert(check);
        init.done();
    });
});

Vue.http.get('/api/checks').then(function(response) {
    init.add(1);
    response.body.forEach(function(check) {
        checks.upsert(check);
        init.done();
    });
});

Vue.http.get('/api/evaluations').then(function(response) {
    init.add(1);
    response.body.forEach(function(evaluation) {
        evaluations.upsert(evaluation);
        init.done();
    });
});

const router = new VueRouter({
    routes: [
        { path: '/', component: { template: '<h1>Hello, world.</h1>' } },
        { path: '/overview', component: { template: '#template-overview' } },
        { path: '/gansoi', component: listNodes },
        { path: '/checks', component: listChecks },
        { path: '/check/view/:id', component: viewCheck },
        { path: '/check/edit/:id', component: editCheck }
    ]
});
