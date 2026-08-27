/* Lythous readiness assessment.
   Fifteen questions, six sections, one 0 to 3 scale, a score out of 45, four
   bands and a critical-gap override. Full specification and the reasoning behind
   every choice is held with the project notes, not here.

   BEFORE LAUNCH, set these two. Until they are set, the result is shown and can
   be printed or saved, and nothing is transmitted anywhere.
     ROUTE_TO   the address or form endpoint that receives an enquiry
     BOOK_URL   the discovery call booking link
   Nothing is stored, sent or read about anybody who does not submit. The
   assessment asks F3 about record keeping, so it cannot quietly do otherwise. */

(function () {
  'use strict';

  var ROUTE_TO = '';
  var BOOK_URL = '';

  /* --------------------------------------------------------------- content */

  /* opts run top to bottom: 3, 2, 1, 0. A fifth "Not sure" row also scores 0
     and is counted on its own, because not knowing is a different finding from
     not having. gap fires at 1 or below. cov is what a deployment covers, and
     null where nothing honestly does. */

  var SECTIONS = [
    { key:'A', label:'Section A', name:'Policy and provision',
      title:'What is in place, and could you show it?',
      qs:[
      { id:'A1',
        q:'Does your institution have a written mental health and wellbeing policy, published where students and parents can find it?',
        src:'Supreme Court guideline I',
        opts:['Yes, published, and reviewed within the last year',
              'Yes, published, but not reviewed recently',
              'Written, but not published externally',
              'Not yet'],
        gap:'A published policy, reviewed each year, is the first thing a parent or a regulator looks for, and the cheapest of these to close.',
        cov:'A deployment supplies the policy document and the annual review cycle.' },
      { id:'A2',
        q:'When a student needs to talk to somebody qualified, who do they see on campus?',
        src:'Supreme Court guidelines II and III',
        opts:['Qualified counsellors on staff, and a student is seen within a week',
              'Qualified counsellors on staff, but waiting times run longer',
              'A named member of staff, not qualified in this field',
              'Nobody holds that role'],
        gap:'Provision that exists but cannot be reached in time is, to the student standing in front of it, the same as no provision.',
        cov:'A deployment provides the formal referral linkage to named independent professionals. Whether that also satisfies the requirement to appoint qualified staff is a judgement for your counsel, not ours.' },
      { id:'A3', critical:true,
        q:'If a student needs professional care beyond the campus, is there a formal referral linkage to named external professionals?',
        src:'Supreme Court guideline II, second limb',
        opts:['Yes, named professionals, with an agreement in place',
              'Yes, informally. Staff know who to call',
              'We give the student a list, or a number',
              'No route out'],
        gap:'A list is not a linkage. Guideline II asks for a formal arrangement with external professionals, and a handed-over phone number is the point at which most referrals quietly end.',
        cov:'Eleven independent qualified professionals across India, each credentialled and practising in their own right.' }
      ]},

    { key:'B', label:'Section B', name:'Recognition',
      title:'Who notices the student who never asks?',
      qs:[
      { id:'B1',
        q:'In the last twelve months, have teaching and non-teaching staff been trained by a qualified professional to notice and respond to warning signs?',
        src:'Supreme Court guidelines VI and VII',
        opts:['Yes, twice or more, all staff, including training on vulnerable groups',
              'Yes, once in the last year',
              'Some staff, or longer ago than that',
              'Not yet'],
        gap:'Twice a year, for all staff, teaching and non-teaching, is the standard the guidance sets. It is also the most commonly missed one.',
        cov:'Staff training twice yearly, delivered by qualified professionals, covering warning signs, first response and referral.' },
      { id:'B2',
        q:'If a student is quietly struggling and never asks for help, is it anybody’s actual job to notice?',
        src:'Supreme Court guideline III',
        opts:['Yes, named people with that responsibility, trained for it',
              'Mentors or wardens do it alongside their other duties',
              'It depends on the individual member of staff',
              'Not really'],
        gap:'Every other route here is inbound. It works for the student who asks. The student who never asks is the one the guidance is written about.',
        cov:'Trained Ambassadors on campus, whose actual job is recognition. Step 01 of the model.' }
      ]},

    { key:'C', label:'Section C', name:'The front door',
      title:'How far is it from deciding to ask, to reaching a person?',
      qs:[
      { id:'C1',
        q:'If a student decided today to get help, how many steps would it take to reach a person?',
        src:'Supreme Court guideline III',
        opts:['One. There is a single place or number everybody knows',
              'Two or three, and they are signposted',
              'It depends who they ask first',
              'There is no route a student would already know to take'],
        gap:'Each step is a place to stop. A student who does not already know where to go is deciding, at every step, whether this is worth the effort.',
        cov:'One room, one number, one name everybody on campus knows. Steps 02 and 03.' },
      { id:'C2',
        q:'Can a student reach a person outside office hours, at night and at weekends?',
        src:'UGC, September 2025',
        opts:['Yes, a person answers, at any hour',
              'Yes, through an external helpline number we publish',
              'Office hours only',
              'Not that I know of'],
        gap:'The hours when somebody most needs to talk to a person are rarely the hours an office is open.',
        cov:'Inbound contact by phone, text, WhatsApp and email, answered by a person, in partnership with Lisners.' }
      ]},

    { key:'D', label:'Section D', name:'Escalation and risk',
      title:'What happens on the worst night of the year?',
      qs:[
      { id:'D1', critical:true,
        q:'Is there a written protocol for what happens when a student is judged to be at immediate risk?',
        src:'Supreme Court guideline V',
        opts:['Yes, written, and staff have been taken through it',
              'Yes, written, but not everybody has seen it',
              'An understood practice, not written down',
              'Not yet'],
        gap:'An understood practice is not a protocol. It cannot be handed to a new warden at 2am, and it cannot be shown to anybody afterwards.',
        cov:'A written escalation protocol, and staff taken through it. Step 05.' },
      { id:'D2',
        q:'Does that protocol name who is contacted, in what order, and how quickly?',
        src:'Supreme Court guideline V',
        opts:['Yes, all three',
              'It names who, but not the order or the timing',
              'Broadly. It depends on the situation',
              'Not yet'],
        gap:'Who, in what order, how fast. A protocol missing any of the three leaves the decision to whoever happens to be there.',
        cov:'The protocol names who is contacted, in what order, and within what time. Step 05.' },
      { id:'D3',
        q:'Are referral routes and helpline numbers displayed where a student would actually see them?',
        src:'Supreme Court guideline V, prominently displayed',
        opts:['Yes, across campus and online, in the places students are',
              'On the website, or on a noticeboard',
              'Available if somebody asks',
              'Not yet'],
        gap:'Information a student has to request is information they will not request on the night they need it.',
        cov:'Displayed routes and numbers, on campus and online, in the places students already are.' }
      ]},

    { key:'E', label:'Section E', name:'Referral and follow-through',
      title:'Does anybody find out what happened next?',
      qs:[
      { id:'E1',
        q:'When a student is referred out, does anybody check that they arrived?',
        src:'No guideline requires this, which is the point',
        opts:['Yes, somebody owns that, and it is recorded',
              'Sometimes, depending on the case',
              'We assume they went',
              'No'],
        gap:'This is the gap nobody is required to close, and the one where people are most often lost. A referral that is not followed up is a phone number, handed to somebody at their worst moment.',
        cov:'Somebody goes with the person until they have arrived, checks that they did, and checks back afterwards. Steps 06 and 07.' },
      { id:'E2',
        q:'Are parents and guardians included, through sensitisation sessions or a route to reach somebody?',
        src:'Supreme Court guideline IX',
        opts:['Yes, regular sessions and a named contact',
              'A contact route, but no sessions',
              'Only once there is a problem',
              'Not yet'],
        gap:'Guideline IX asks for regular sensitisation for parents and guardians. First contact with a family at the point of crisis is the hardest version of that conversation.',
        cov:'Sessions for parents and guardians, and a named person a family can reach.' }
      ]},

    { key:'F', label:'Section F', name:'Evidence and records',
      title:'Could you show your year, if you were asked to?',
      qs:[
      { id:'F1', critical:true,
        q:'Could you show, for the last academic year, how many students used support, what was referred onward, and what happened next?',
        src:'Supreme Court guideline X',
        opts:['Yes, in a report we already produce',
              'The data exists, but it would have to be assembled',
              'Partly',
              'Not in any complete form'],
        gap:'Provision you cannot evidence is provision you cannot rely on, and the year in which somebody asks for it is the worst year to start collecting it.',
        cov:'Anonymised utilisation, referral and follow-through reporting. Numbers and patterns, never individual names.' },
      { id:'F2',
        q:'Do you produce an annual anonymised report of wellbeing activity, referrals and staff training for your regulator?',
        src:'Supreme Court guideline X',
        opts:['Yes, submitted annually',
              'We compile something internally',
              'Not in that form',
              'Not yet'],
        gap:'The annual anonymised report is an explicit requirement, and it is the one deliverable on this list that nobody in the market is helping institutions produce.',
        cov:'The annual anonymised report, assembled in the form the regulator asks for.' },
      { id:'F3',
        q:'Is it written down what is recorded about a student who asks for help, and who can see it?',
        src:'India’s DPDP Act',
        opts:['Yes, written, and students are told',
              'Understood internally, not written for students',
              'It varies between services',
              'Not yet'],
        gap:'A student deciding whether to walk in is deciding what it will cost them. If the answer is not written down, they will assume the worst of it.',
        cov:null,
        covNone:'This one stays with you. Nothing is written down about a person in a Lythous without them knowing, but your institution’s own records remain yours to define.' }
      ]}
  ];

  var BANDS = [
    { min:37, name:'Connected',
      say:'The parts are in place, and they reach each other.',
      head:'You are further along than most institutions we see.',
      body:'The provision is there, and it connects. The conversation worth having is probably not about building more of it. It is about whether you could evidence all of it if you were asked to, and about the students who still are not reaching any of it.' },
    { min:26, name:'Assembled',
      say:'The pieces exist. The connection between them does not.',
      head:'Your resources already exist. The connection between them does not.',
      body:'You have the counsellors, the staff who care, and somewhere for a student to go. What is missing is the layer that makes them work as one system around one person, so that a student meets a route rather than a list. That layer is what a Lythous is.' },
    { min:14, name:'Uneven',
      say:'Some of it exists, in some places, for some people.',
      head:'Some of this exists, in some places, for some people.',
      body:'That is the ordinary state of an institution that has grown its support department by department. The gaps below are not a verdict on anybody. They are the places where a student can fall between two things that both work. The sensible starting point is one campus or one faculty, not the whole estate at once.' },
    { min:0, name:'Early',
      say:'The structure is not there yet.',
      head:'The structure is not there yet.',
      body:'That is a clearer place to start from than a half-built one. There is nothing to unpick, and the guidance gives you the order to build in. The next step is a conversation, not a proposal.' }
  ];

  /* priority copy for a critical question left at zero, in severity order */
  var CRITICAL = {
    D1:{ none:'You told us there is no written protocol for what happens when a student is at immediate risk.',
         unsure:'You were not sure whether there is a written protocol for a student at immediate risk.' },
    A3:{ none:'You told us there is no formal route to a professional outside the institution.',
         unsure:'You were not sure whether there is a formal route to a professional outside the institution.' },
    F1:{ none:'You told us last year’s support activity could not be produced in any complete form.',
         unsure:'You were not sure whether last year’s support activity could be produced.' }
  };
  var CRITICAL_ORDER = ['D1','A3','F1'];

  /* ------------------------------------------------------------------ state */

  var answers = {};              // id -> {score, unsure, optionText}
  var TOTAL_Q = 0;
  SECTIONS.forEach(function (s) { TOTAL_Q += s.qs.length; });

  var root = document.getElementById('asmt');
  if (!root) return;
  var openBtn = document.getElementById('asmt-open');
  var body    = document.getElementById('asmt-body');
  var form    = document.getElementById('asmt-form');
  var result  = document.getElementById('asmt-result');
  var fill    = document.getElementById('asmt-fill');
  var count   = document.getElementById('asmt-count');
  var submit  = document.getElementById('asmt-submit');
  var left    = document.getElementById('asmt-left');
  var still   = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  function esc (s) {
    return String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;')
                    .replace(/>/g,'&gt;').replace(/"/g,'&quot;');
  }

  function field (nm, lb, ty, req) {
    return '<div class="asmt-f"><label for="f-' + nm + '">' + esc(lb) +
           (req ? '' : ' <span class="opt">optional</span>') + '</label>' +
           '<input id="f-' + nm + '" name="' + nm + '" type="' + ty + '"' +
           (req ? ' required' : '') + (nm === 'students' ? ' inputmode="numeric"' : '') +
           '></div>';
  }

  /* ----------------------------------------------------------------- build */

  function build () {
    var html = '';
    SECTIONS.forEach(function (sec) {
      html += '<div class="asmt-sec">' +
              '<span class="label">' + esc(sec.label) + ' &middot; ' + esc(sec.name) + '</span>' +
              '<h3>' + esc(sec.title) + '</h3>';
      sec.qs.forEach(function (q) {
        html += '<fieldset class="asmt-q" id="q-' + q.id + '">' +
                '<legend>' + esc(q.q) + '</legend>' +
                '<span class="asmt-src">' + esc(q.src) + '</span>';
        q.opts.forEach(function (t, i) {
          var score = 3 - i;
          html += '<label class="asmt-opt">' +
                  '<input type="radio" name="' + q.id + '" value="' + score + '">' +
                  '<span class="dot"></span><span class="txt">' + esc(t) + '</span></label>';
        });
        html += '<label class="asmt-opt unsure">' +
                '<input type="radio" name="' + q.id + '" value="x">' +
                '<span class="dot"></span><span class="txt">Not sure</span></label>' +
                '</fieldset>';
      });
      html += '</div>';
    });
    form.innerHTML = html;
  }

  function onPick (e) {
    var t = e.target;
    if (!t || t.type !== 'radio') return;
    var unsure = t.value === 'x';
    answers[t.name] = {
      score: unsure ? 0 : parseInt(t.value, 10),
      unsure: unsure,
      text: t.parentNode.querySelector('.txt').textContent
    };
    var fs = document.getElementById('q-' + t.name);
    if (fs) fs.classList.add('answered');
    progress();
  }

  function answered () { return Object.keys(answers).length; }

  function progress () {
    var n = answered();
    count.textContent = n + ' of ' + TOTAL_Q;
    fill.style.width = (n / TOTAL_Q * 100) + '%';
    var done = n === TOTAL_Q;
    submit.disabled = !done;
    left.textContent = done
      ? 'Nothing has been sent anywhere.'
      : (TOTAL_Q - n) + (TOTAL_Q - n === 1 ? ' question left.' : ' questions left.');
  }

  /* ---------------------------------------------------------------- scoring */

  function grade () {
    var total = 0, unsure = 0, gaps = [], domains = [], crit = [];

    SECTIONS.forEach(function (sec) {
      var got = 0, max = sec.qs.length * 3;
      sec.qs.forEach(function (q) {
        var a = answers[q.id];
        got += a.score;
        total += a.score;
        if (a.unsure) unsure++;
        if (a.score <= 1) gaps.push({ q:q, a:a, sec:sec });
        if (q.critical && a.score === 0) crit.push({ id:q.id, unsure:a.unsure });
      });
      domains.push({ name:sec.name, got:got, max:max });
    });

    var band = BANDS[BANDS.length - 1];
    for (var i = 0; i < BANDS.length; i++) {
      if (total >= BANDS[i].min) { band = BANDS[i]; break; }
    }
    /* the override: no institution reads as Connected while a route out, a
       written escalation protocol or the ability to evidence a year is missing */
    if (crit.length && band.name === 'Connected') band = BANDS[1];

    crit.sort(function (a, b) {
      return CRITICAL_ORDER.indexOf(a.id) - CRITICAL_ORDER.indexOf(b.id);
    });

    return { total:total, band:band, gaps:gaps, domains:domains,
             crit:crit.slice(0, 2), unsure:unsure };
  }

  /* ----------------------------------------------------------------- result */

  function render (r) {
    var h = '';

    if (r.crit.length) {
      h += '<div class="asmt-flag"><span class="label">Worth looking at first</span>';
      r.crit.forEach(function (c) {
        h += '<p>' + esc(CRITICAL[c.id][c.unsure ? 'unsure' : 'none']) + '</p>';
      });
      h += '<p>Whatever else is in place, that is the one to close first, and it is the one a review would look for first.</p></div>';
    }

    h += '<div class="asmt-score">' +
         '<p class="asmt-num">' + r.total + '<span>/ 45</span></p>' +
         '<div><p class="asmt-band">' + esc(r.band.head) + '</p>' +
         '<p class="asmt-band-say">' + esc(r.band.body) + '</p>' +
         '<div class="asmt-bars" style="margin-top:28px">';
    r.domains.forEach(function (d) {
      var pc = Math.round(d.got / d.max * 100);
      h += '<div class="asmt-bar' + (pc < 50 ? ' low' : '') + '">' +
           '<span class="nm">' + esc(d.name) + '</span>' +
           '<span class="vl">' + d.got + ' / ' + d.max + '</span>' +
           '<span class="tr"><span class="fl" data-w="' + pc + '"></span></span></div>';
    });
    h += '</div></div></div>';

    h += '<div class="asmt-block"><span class="label">What we found</span>';
    if (!r.gaps.length) {
      h += '<h3>Nothing on this list came back thin.</h3>' +
           '<p class="asmt-clear">That is rare. The useful conversation is no longer about what is missing, it is about whether all of it could be evidenced on request, and about the students who still are not reaching any of it.</p>';
    } else {
      h += '<h3>' + r.gaps.length + (r.gaps.length === 1 ? ' gap' : ' gaps') +
           ', and what a deployment covers</h3>';
      r.gaps.forEach(function (g) {
        h += '<div class="asmt-gap"><b>' + esc(g.sec.name) + ' &middot; ' + esc(g.q.src) + '</b>' +
             '<p>' + esc(g.q.gap) + '</p>';
        if (g.q.cov) {
          h += '<span class="cov">Covered: ' + esc(g.q.cov) + '</span>';
        } else if (g.q.covNone) {
          h += '<span class="cov none">' + esc(g.q.covNone) + '</span>';
        }
        h += '</div>';
      });
    }
    if (r.unsure) {
      h += '<p class="asmt-unsure">' + r.unsure +
           (r.unsure === 1 ? ' answer was' : ' answers were') +
           ' &ldquo;not sure&rdquo;. That is not unusual, and it is worth knowing. Where a provision cannot be described from the centre, it usually exists in one department and nowhere else.</p>';
    }
    h += '</div>';

    h += '<p class="asmt-caveat">This maps what you told us against what recent Supreme Court and UGC guidance asks of higher education institutions. It is a mapping, not a compliance assessment, and it is not legal advice. What it satisfies is your counsel’s judgement, not ours. Anyone promising you compliance is overselling.</p>';

    h += '<div class="asmt-send"><h3>Take this away</h3>' +
         '<p>Save it as a PDF and forward it. It carries the score, every gap, the guideline each one relates to, and what a deployment covers against it.</p>' +
         '<div class="asmt-go"><button type="button" class="btn btn-solid btn-lg" id="asmt-print">Save or print this summary</button>' +
         (BOOK_URL ? '<a class="btn btn-lg" href="' + esc(BOOK_URL) + '">Book a discovery call</a>' : '') +
         '</div>' +
         '<p class="asmt-alt">No obligation, and no sales call unless you ask for one. Your answers stayed in this browser and have not been sent anywhere.</p>' +
         '</div>';

    /* Capture. Shown only once ROUTE_TO is set, because a form that goes
       nowhere is worse than no form. Four fields, and one that qualifies. */
    if (ROUTE_TO) {
      h += '<form class="asmt-send" id="asmt-capture" method="post" action="' + esc(ROUTE_TO) + '">' +
           '<h3>Or have it emailed to you</h3>' +
           '<p>We send the same summary, once. You decide whether there is a conversation after that.</p>' +
           '<div class="asmt-fields">' +
           field('name', 'Your name', 'text', true) +
           field('role', 'Your role', 'text', true) +
           field('institution', 'Institution', 'text', true) +
           field('email', 'Work email', 'email', true) +
           field('students', 'Number of students', 'text', false) +
           '</div>' +
           '<input type="hidden" name="score" value="' + r.total + '">' +
           '<input type="hidden" name="band" value="' + esc(r.band.name) + '">' +
           '<input type="hidden" name="answers" value="' + esc(JSON.stringify(
              Object.keys(answers).reduce(function (o, k) {
                o[k] = answers[k].unsure ? 'not sure' : answers[k].score; return o;
              }, {}))) + '">' +
           '<div class="asmt-go"><button type="submit" class="btn btn-solid btn-lg">Email me the summary</button></div>' +
           '<p class="asmt-alt">Nothing is sent until you press that.</p>' +
           '</form>';
    }

    result.innerHTML = h;
    result.hidden = false;

    var pr = document.getElementById('asmt-print');
    if (pr) pr.addEventListener('click', function () { window.print(); });

    /* Flush style so the bars have a computed starting width of zero, then set
       the real width in the same turn. The transition runs from that. Reading
       offsetWidth rather than waiting on requestAnimationFrame, because rAF does
       not fire in a background tab and the bars would stay empty. Under reduced
       motion the CSS transition is off, so this simply sets them. */
    var bars = result.querySelectorAll('.fl');
    void result.offsetWidth;
    Array.prototype.forEach.call(bars, function (b) {
      b.style.width = b.getAttribute('data-w') + '%';
    });

    result.setAttribute('tabindex', '-1');
    result.focus();
    result.scrollIntoView({ behavior: still ? 'auto' : 'smooth', block:'start' });
  }

  /* -------------------------------------------------------------- behaviour */

  build();
  form.addEventListener('change', onPick);
  progress();

  openBtn.addEventListener('click', function () {
    body.hidden = false;
    /* the heading stays: it is the section's only h2, and the form needs it */
    openBtn.hidden = true;
    var note = root.querySelector('.asmt-note');
    if (note) note.hidden = true;
    var first = form.querySelector('legend');
    if (first) {
      first.parentNode.setAttribute('tabindex', '-1');
      first.parentNode.focus();
      first.parentNode.scrollIntoView({ behavior: still ? 'auto' : 'smooth', block:'start' });
    }
  });

  submit.addEventListener('click', function () {
    if (answered() !== TOTAL_Q) return;
    render(grade());
  });

})();
