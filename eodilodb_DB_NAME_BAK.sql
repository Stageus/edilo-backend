--
-- PostgreSQL database dump
--

-- Dumped from database version 12.12 (Ubuntu 12.12-0ubuntu0.20.04.1)
-- Dumped by pg_dump version 12.12 (Ubuntu 12.12-0ubuntu0.20.04.1)

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

--
-- Name: eodilo; Type: SCHEMA; Schema: -; Owner: ubuntu
--

CREATE SCHEMA eodilo;


ALTER SCHEMA eodilo OWNER TO ubuntu;

SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: account; Type: TABLE; Schema: eodilo; Owner: ubuntu
--

CREATE TABLE eodilo.account (
    userindex integer NOT NULL,
    userid character varying(20) NOT NULL,
    useremail character varying(320) NOT NULL,
    usernickname character varying(20) NOT NULL,
    userpw character varying(20) NOT NULL,
    username character varying(20) NOT NULL,
    userprofileimgurl character varying(200),
    date timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE eodilo.account OWNER TO ubuntu;

--
-- Name: account_userindex_seq; Type: SEQUENCE; Schema: eodilo; Owner: ubuntu
--

CREATE SEQUENCE eodilo.account_userindex_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE eodilo.account_userindex_seq OWNER TO ubuntu;

--
-- Name: account_userindex_seq; Type: SEQUENCE OWNED BY; Schema: eodilo; Owner: ubuntu
--

ALTER SEQUENCE eodilo.account_userindex_seq OWNED BY eodilo.account.userindex;


--
-- Name: alarm; Type: TABLE; Schema: eodilo; Owner: ubuntu
--

CREATE TABLE eodilo.alarm (
    alarmindex integer NOT NULL,
    senderindex integer NOT NULL,
    alarmdate date DEFAULT CURRENT_DATE,
    alarmcategory integer NOT NULL,
    userindex integer NOT NULL,
    postindex integer NOT NULL,
    date timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE eodilo.alarm OWNER TO ubuntu;

--
-- Name: alarm_alarmindex_seq; Type: SEQUENCE; Schema: eodilo; Owner: ubuntu
--

CREATE SEQUENCE eodilo.alarm_alarmindex_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE eodilo.alarm_alarmindex_seq OWNER TO ubuntu;

--
-- Name: alarm_alarmindex_seq; Type: SEQUENCE OWNED BY; Schema: eodilo; Owner: ubuntu
--

ALTER SEQUENCE eodilo.alarm_alarmindex_seq OWNED BY eodilo.alarm.alarmindex;


--
-- Name: city; Type: TABLE; Schema: eodilo; Owner: ubuntu
--

CREATE TABLE eodilo.city (
    cityindex integer NOT NULL,
    cityname character varying(100),
    citycategory character varying(20),
    citycountry character varying(20),
    citytimediff time without time zone,
    cityexchange integer,
    citytemperature integer,
    citycoordinatexy point,
    cityenglishname character varying(100),
    cityinfo text,
    cityflighttime time without time zone,
    cityvisa integer,
    cityimgurl character varying(100),
    date timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE eodilo.city OWNER TO ubuntu;

--
-- Name: city_cityindex_seq; Type: SEQUENCE; Schema: eodilo; Owner: ubuntu
--

CREATE SEQUENCE eodilo.city_cityindex_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE eodilo.city_cityindex_seq OWNER TO ubuntu;

--
-- Name: city_cityindex_seq; Type: SEQUENCE OWNED BY; Schema: eodilo; Owner: ubuntu
--

ALTER SEQUENCE eodilo.city_cityindex_seq OWNED BY eodilo.city.cityindex;


--
-- Name: comment; Type: TABLE; Schema: eodilo; Owner: ubuntu
--

CREATE TABLE eodilo.comment (
    commentindex integer NOT NULL,
    commentdate date DEFAULT CURRENT_DATE,
    commentcontent text,
    userindex integer NOT NULL,
    postindex integer NOT NULL,
    date timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE eodilo.comment OWNER TO ubuntu;

--
-- Name: comment_commentindex_seq; Type: SEQUENCE; Schema: eodilo; Owner: ubuntu
--

CREATE SEQUENCE eodilo.comment_commentindex_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE eodilo.comment_commentindex_seq OWNER TO ubuntu;

--
-- Name: comment_commentindex_seq; Type: SEQUENCE OWNED BY; Schema: eodilo; Owner: ubuntu
--

ALTER SEQUENCE eodilo.comment_commentindex_seq OWNED BY eodilo.comment.commentindex;


--
-- Name: like; Type: TABLE; Schema: eodilo; Owner: ubuntu
--

CREATE TABLE eodilo."like" (
    likeindex integer NOT NULL,
    postindex integer NOT NULL,
    userindex integer NOT NULL,
    date timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE eodilo."like" OWNER TO ubuntu;

--
-- Name: like_likeindex_seq; Type: SEQUENCE; Schema: eodilo; Owner: ubuntu
--

CREATE SEQUENCE eodilo.like_likeindex_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE eodilo.like_likeindex_seq OWNER TO ubuntu;

--
-- Name: like_likeindex_seq; Type: SEQUENCE OWNED BY; Schema: eodilo; Owner: ubuntu
--

ALTER SEQUENCE eodilo.like_likeindex_seq OWNED BY eodilo."like".likeindex;


--
-- Name: post; Type: TABLE; Schema: eodilo; Owner: ubuntu
--

CREATE TABLE eodilo.post (
    postindex integer NOT NULL,
    postcategory integer NOT NULL,
    posttitle character varying(100) NOT NULL,
    postcontent text,
    postdate date DEFAULT CURRENT_DATE,
    postimgurl character varying(200)[],
    postviews integer DEFAULT 0,
    cityindex integer NOT NULL,
    userindex integer NOT NULL,
    date timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE eodilo.post OWNER TO ubuntu;

--
-- Name: post_postindex_seq; Type: SEQUENCE; Schema: eodilo; Owner: ubuntu
--

CREATE SEQUENCE eodilo.post_postindex_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE eodilo.post_postindex_seq OWNER TO ubuntu;

--
-- Name: post_postindex_seq; Type: SEQUENCE OWNED BY; Schema: eodilo; Owner: ubuntu
--

ALTER SEQUENCE eodilo.post_postindex_seq OWNED BY eodilo.post.postindex;


--
-- Name: schedule; Type: TABLE; Schema: eodilo; Owner: ubuntu
--

CREATE TABLE eodilo.schedule (
    scheduleindex integer NOT NULL,
    schedulename character varying(20) NOT NULL,
    scheduledate date NOT NULL,
    userindex integer NOT NULL,
    cityindex integer NOT NULL,
    date timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE eodilo.schedule OWNER TO ubuntu;

--
-- Name: schedule_scheduleindex_seq; Type: SEQUENCE; Schema: eodilo; Owner: ubuntu
--

CREATE SEQUENCE eodilo.schedule_scheduleindex_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE eodilo.schedule_scheduleindex_seq OWNER TO ubuntu;

--
-- Name: schedule_scheduleindex_seq; Type: SEQUENCE OWNED BY; Schema: eodilo; Owner: ubuntu
--

ALTER SEQUENCE eodilo.schedule_scheduleindex_seq OWNED BY eodilo.schedule.scheduleindex;


--
-- Name: scheduleblock; Type: TABLE; Schema: eodilo; Owner: ubuntu
--

CREATE TABLE eodilo.scheduleblock (
    blockindex integer NOT NULL,
    blockorder integer NOT NULL,
    blockname character varying(20) NOT NULL,
    blockcategory integer NOT NULL,
    blocktime time without time zone,
    blockcost integer,
    blockcoordinatexy point,
    scheduleindex integer NOT NULL
);


ALTER TABLE eodilo.scheduleblock OWNER TO ubuntu;

--
-- Name: scheduleblock_blockindex_seq; Type: SEQUENCE; Schema: eodilo; Owner: ubuntu
--

CREATE SEQUENCE eodilo.scheduleblock_blockindex_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE eodilo.scheduleblock_blockindex_seq OWNER TO ubuntu;

--
-- Name: scheduleblock_blockindex_seq; Type: SEQUENCE OWNED BY; Schema: eodilo; Owner: ubuntu
--

ALTER SEQUENCE eodilo.scheduleblock_blockindex_seq OWNED BY eodilo.scheduleblock.blockindex;


--
-- Name: scrap; Type: TABLE; Schema: eodilo; Owner: ubuntu
--

CREATE TABLE eodilo.scrap (
    scrapindex integer NOT NULL,
    scrapdate date DEFAULT CURRENT_DATE,
    postindex integer NOT NULL,
    userindex integer NOT NULL,
    date timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE eodilo.scrap OWNER TO ubuntu;

--
-- Name: scrap_scrapindex_seq; Type: SEQUENCE; Schema: eodilo; Owner: ubuntu
--

CREATE SEQUENCE eodilo.scrap_scrapindex_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE eodilo.scrap_scrapindex_seq OWNER TO ubuntu;

--
-- Name: scrap_scrapindex_seq; Type: SEQUENCE OWNED BY; Schema: eodilo; Owner: ubuntu
--

ALTER SEQUENCE eodilo.scrap_scrapindex_seq OWNED BY eodilo.scrap.scrapindex;


--
-- Name: account userindex; Type: DEFAULT; Schema: eodilo; Owner: ubuntu
--

ALTER TABLE ONLY eodilo.account ALTER COLUMN userindex SET DEFAULT nextval('eodilo.account_userindex_seq'::regclass);


--
-- Name: alarm alarmindex; Type: DEFAULT; Schema: eodilo; Owner: ubuntu
--

ALTER TABLE ONLY eodilo.alarm ALTER COLUMN alarmindex SET DEFAULT nextval('eodilo.alarm_alarmindex_seq'::regclass);


--
-- Name: city cityindex; Type: DEFAULT; Schema: eodilo; Owner: ubuntu
--

ALTER TABLE ONLY eodilo.city ALTER COLUMN cityindex SET DEFAULT nextval('eodilo.city_cityindex_seq'::regclass);


--
-- Name: comment commentindex; Type: DEFAULT; Schema: eodilo; Owner: ubuntu
--

ALTER TABLE ONLY eodilo.comment ALTER COLUMN commentindex SET DEFAULT nextval('eodilo.comment_commentindex_seq'::regclass);


--
-- Name: like likeindex; Type: DEFAULT; Schema: eodilo; Owner: ubuntu
--

ALTER TABLE ONLY eodilo."like" ALTER COLUMN likeindex SET DEFAULT nextval('eodilo.like_likeindex_seq'::regclass);


--
-- Name: post postindex; Type: DEFAULT; Schema: eodilo; Owner: ubuntu
--

ALTER TABLE ONLY eodilo.post ALTER COLUMN postindex SET DEFAULT nextval('eodilo.post_postindex_seq'::regclass);


--
-- Name: schedule scheduleindex; Type: DEFAULT; Schema: eodilo; Owner: ubuntu
--

ALTER TABLE ONLY eodilo.schedule ALTER COLUMN scheduleindex SET DEFAULT nextval('eodilo.schedule_scheduleindex_seq'::regclass);


--
-- Name: scheduleblock blockindex; Type: DEFAULT; Schema: eodilo; Owner: ubuntu
--

ALTER TABLE ONLY eodilo.scheduleblock ALTER COLUMN blockindex SET DEFAULT nextval('eodilo.scheduleblock_blockindex_seq'::regclass);


--
-- Name: scrap scrapindex; Type: DEFAULT; Schema: eodilo; Owner: ubuntu
--

ALTER TABLE ONLY eodilo.scrap ALTER COLUMN scrapindex SET DEFAULT nextval('eodilo.scrap_scrapindex_seq'::regclass);


--
-- Data for Name: account; Type: TABLE DATA; Schema: eodilo; Owner: ubuntu
--

COPY eodilo.account (userindex, userid, useremail, usernickname, userpw, username, userprofileimgurl, date) FROM stdin;
\.


--
-- Data for Name: alarm; Type: TABLE DATA; Schema: eodilo; Owner: ubuntu
--

COPY eodilo.alarm (alarmindex, senderindex, alarmdate, alarmcategory, userindex, postindex, date) FROM stdin;
\.


--
-- Data for Name: city; Type: TABLE DATA; Schema: eodilo; Owner: ubuntu
--

COPY eodilo.city (cityindex, cityname, citycategory, citycountry, citytimediff, cityexchange, citytemperature, citycoordinatexy, cityenglishname, cityinfo, cityflighttime, cityvisa, cityimgurl, date) FROM stdin;
\.


--
-- Data for Name: comment; Type: TABLE DATA; Schema: eodilo; Owner: ubuntu
--

COPY eodilo.comment (commentindex, commentdate, commentcontent, userindex, postindex, date) FROM stdin;
\.


--
-- Data for Name: like; Type: TABLE DATA; Schema: eodilo; Owner: ubuntu
--

COPY eodilo."like" (likeindex, postindex, userindex, date) FROM stdin;
\.


--
-- Data for Name: post; Type: TABLE DATA; Schema: eodilo; Owner: ubuntu
--

COPY eodilo.post (postindex, postcategory, posttitle, postcontent, postdate, postimgurl, postviews, cityindex, userindex, date) FROM stdin;
\.


--
-- Data for Name: schedule; Type: TABLE DATA; Schema: eodilo; Owner: ubuntu
--

COPY eodilo.schedule (scheduleindex, schedulename, scheduledate, userindex, cityindex, date) FROM stdin;
\.


--
-- Data for Name: scheduleblock; Type: TABLE DATA; Schema: eodilo; Owner: ubuntu
--

COPY eodilo.scheduleblock (blockindex, blockorder, blockname, blockcategory, blocktime, blockcost, blockcoordinatexy, scheduleindex) FROM stdin;
\.


--
-- Data for Name: scrap; Type: TABLE DATA; Schema: eodilo; Owner: ubuntu
--

COPY eodilo.scrap (scrapindex, scrapdate, postindex, userindex, date) FROM stdin;
\.


--
-- Name: account_userindex_seq; Type: SEQUENCE SET; Schema: eodilo; Owner: ubuntu
--

SELECT pg_catalog.setval('eodilo.account_userindex_seq', 1, false);


--
-- Name: alarm_alarmindex_seq; Type: SEQUENCE SET; Schema: eodilo; Owner: ubuntu
--

SELECT pg_catalog.setval('eodilo.alarm_alarmindex_seq', 1, false);


--
-- Name: city_cityindex_seq; Type: SEQUENCE SET; Schema: eodilo; Owner: ubuntu
--

SELECT pg_catalog.setval('eodilo.city_cityindex_seq', 1, false);


--
-- Name: comment_commentindex_seq; Type: SEQUENCE SET; Schema: eodilo; Owner: ubuntu
--

SELECT pg_catalog.setval('eodilo.comment_commentindex_seq', 1, false);


--
-- Name: like_likeindex_seq; Type: SEQUENCE SET; Schema: eodilo; Owner: ubuntu
--

SELECT pg_catalog.setval('eodilo.like_likeindex_seq', 1, false);


--
-- Name: post_postindex_seq; Type: SEQUENCE SET; Schema: eodilo; Owner: ubuntu
--

SELECT pg_catalog.setval('eodilo.post_postindex_seq', 1, false);


--
-- Name: schedule_scheduleindex_seq; Type: SEQUENCE SET; Schema: eodilo; Owner: ubuntu
--

SELECT pg_catalog.setval('eodilo.schedule_scheduleindex_seq', 1, false);


--
-- Name: scheduleblock_blockindex_seq; Type: SEQUENCE SET; Schema: eodilo; Owner: ubuntu
--

SELECT pg_catalog.setval('eodilo.scheduleblock_blockindex_seq', 1, false);


--
-- Name: scrap_scrapindex_seq; Type: SEQUENCE SET; Schema: eodilo; Owner: ubuntu
--

SELECT pg_catalog.setval('eodilo.scrap_scrapindex_seq', 1, false);


--
-- Name: account account_pkey; Type: CONSTRAINT; Schema: eodilo; Owner: ubuntu
--

ALTER TABLE ONLY eodilo.account
    ADD CONSTRAINT account_pkey PRIMARY KEY (userindex);


--
-- Name: account account_useremail_key; Type: CONSTRAINT; Schema: eodilo; Owner: ubuntu
--

ALTER TABLE ONLY eodilo.account
    ADD CONSTRAINT account_useremail_key UNIQUE (useremail);


--
-- Name: account account_userid_key; Type: CONSTRAINT; Schema: eodilo; Owner: ubuntu
--

ALTER TABLE ONLY eodilo.account
    ADD CONSTRAINT account_userid_key UNIQUE (userid);


--
-- Name: account account_usernickname_key; Type: CONSTRAINT; Schema: eodilo; Owner: ubuntu
--

ALTER TABLE ONLY eodilo.account
    ADD CONSTRAINT account_usernickname_key UNIQUE (usernickname);


--
-- Name: alarm alarm_pkey; Type: CONSTRAINT; Schema: eodilo; Owner: ubuntu
--

ALTER TABLE ONLY eodilo.alarm
    ADD CONSTRAINT alarm_pkey PRIMARY KEY (alarmindex);


--
-- Name: city city_pkey; Type: CONSTRAINT; Schema: eodilo; Owner: ubuntu
--

ALTER TABLE ONLY eodilo.city
    ADD CONSTRAINT city_pkey PRIMARY KEY (cityindex);


--
-- Name: comment comment_pkey; Type: CONSTRAINT; Schema: eodilo; Owner: ubuntu
--

ALTER TABLE ONLY eodilo.comment
    ADD CONSTRAINT comment_pkey PRIMARY KEY (commentindex);


--
-- Name: like like_pkey; Type: CONSTRAINT; Schema: eodilo; Owner: ubuntu
--

ALTER TABLE ONLY eodilo."like"
    ADD CONSTRAINT like_pkey PRIMARY KEY (likeindex);


--
-- Name: post post_pkey; Type: CONSTRAINT; Schema: eodilo; Owner: ubuntu
--

ALTER TABLE ONLY eodilo.post
    ADD CONSTRAINT post_pkey PRIMARY KEY (postindex);


--
-- Name: schedule schedule_pkey; Type: CONSTRAINT; Schema: eodilo; Owner: ubuntu
--

ALTER TABLE ONLY eodilo.schedule
    ADD CONSTRAINT schedule_pkey PRIMARY KEY (scheduleindex);


--
-- Name: schedule schedule_schedulename_key; Type: CONSTRAINT; Schema: eodilo; Owner: ubuntu
--

ALTER TABLE ONLY eodilo.schedule
    ADD CONSTRAINT schedule_schedulename_key UNIQUE (schedulename);


--
-- Name: scheduleblock scheduleblock_pkey; Type: CONSTRAINT; Schema: eodilo; Owner: ubuntu
--

ALTER TABLE ONLY eodilo.scheduleblock
    ADD CONSTRAINT scheduleblock_pkey PRIMARY KEY (blockindex);


--
-- Name: scrap scrap_pkey; Type: CONSTRAINT; Schema: eodilo; Owner: ubuntu
--

ALTER TABLE ONLY eodilo.scrap
    ADD CONSTRAINT scrap_pkey PRIMARY KEY (scrapindex);


--
-- Name: alarm alarm_postindex_fkey; Type: FK CONSTRAINT; Schema: eodilo; Owner: ubuntu
--

ALTER TABLE ONLY eodilo.alarm
    ADD CONSTRAINT alarm_postindex_fkey FOREIGN KEY (postindex) REFERENCES eodilo.post(postindex) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: alarm alarm_senderindex_fkey; Type: FK CONSTRAINT; Schema: eodilo; Owner: ubuntu
--

ALTER TABLE ONLY eodilo.alarm
    ADD CONSTRAINT alarm_senderindex_fkey FOREIGN KEY (senderindex) REFERENCES eodilo.account(userindex) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: alarm alarm_userindex_fkey; Type: FK CONSTRAINT; Schema: eodilo; Owner: ubuntu
--

ALTER TABLE ONLY eodilo.alarm
    ADD CONSTRAINT alarm_userindex_fkey FOREIGN KEY (userindex) REFERENCES eodilo.account(userindex) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: comment comment_postindex_fkey; Type: FK CONSTRAINT; Schema: eodilo; Owner: ubuntu
--

ALTER TABLE ONLY eodilo.comment
    ADD CONSTRAINT comment_postindex_fkey FOREIGN KEY (postindex) REFERENCES eodilo.post(postindex) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: comment comment_userindex_fkey; Type: FK CONSTRAINT; Schema: eodilo; Owner: ubuntu
--

ALTER TABLE ONLY eodilo.comment
    ADD CONSTRAINT comment_userindex_fkey FOREIGN KEY (userindex) REFERENCES eodilo.account(userindex) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: like like_userindex_fkey; Type: FK CONSTRAINT; Schema: eodilo; Owner: ubuntu
--

ALTER TABLE ONLY eodilo."like"
    ADD CONSTRAINT like_userindex_fkey FOREIGN KEY (userindex) REFERENCES eodilo.account(userindex) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: post post_cityindex_fkey; Type: FK CONSTRAINT; Schema: eodilo; Owner: ubuntu
--

ALTER TABLE ONLY eodilo.post
    ADD CONSTRAINT post_cityindex_fkey FOREIGN KEY (cityindex) REFERENCES eodilo.city(cityindex) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: post post_userindex_fkey; Type: FK CONSTRAINT; Schema: eodilo; Owner: ubuntu
--

ALTER TABLE ONLY eodilo.post
    ADD CONSTRAINT post_userindex_fkey FOREIGN KEY (userindex) REFERENCES eodilo.account(userindex) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: schedule schedule_cityindex_fkey; Type: FK CONSTRAINT; Schema: eodilo; Owner: ubuntu
--

ALTER TABLE ONLY eodilo.schedule
    ADD CONSTRAINT schedule_cityindex_fkey FOREIGN KEY (cityindex) REFERENCES eodilo.city(cityindex) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: schedule schedule_userindex_fkey; Type: FK CONSTRAINT; Schema: eodilo; Owner: ubuntu
--

ALTER TABLE ONLY eodilo.schedule
    ADD CONSTRAINT schedule_userindex_fkey FOREIGN KEY (userindex) REFERENCES eodilo.account(userindex) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: scheduleblock scheduleblock_scheduleindex_fkey; Type: FK CONSTRAINT; Schema: eodilo; Owner: ubuntu
--

ALTER TABLE ONLY eodilo.scheduleblock
    ADD CONSTRAINT scheduleblock_scheduleindex_fkey FOREIGN KEY (scheduleindex) REFERENCES eodilo.schedule(scheduleindex) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: scrap scrap_postindex_fkey; Type: FK CONSTRAINT; Schema: eodilo; Owner: ubuntu
--

ALTER TABLE ONLY eodilo.scrap
    ADD CONSTRAINT scrap_postindex_fkey FOREIGN KEY (postindex) REFERENCES eodilo.post(postindex) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: scrap scrap_userindex_fkey; Type: FK CONSTRAINT; Schema: eodilo; Owner: ubuntu
--

ALTER TABLE ONLY eodilo.scrap
    ADD CONSTRAINT scrap_userindex_fkey FOREIGN KEY (userindex) REFERENCES eodilo.account(userindex) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- PostgreSQL database dump complete
--

