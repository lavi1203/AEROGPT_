import React from 'react';
import { motion } from 'framer-motion';
import { Brain, Library, MessageSquare, Rocket, ChevronRight } from 'lucide-react';
import { MISSIONS } from '../data/missions';

const fadeUp = {
  hidden: { opacity: 0, y: 28 },
  show:   { opacity: 1, y: 0, transition: { duration: 0.55, ease: [0.22, 1, 0.36, 1] } },
};

const stagger = {
  hidden: {},
  show:   { transition: { staggerChildren: 0.12 } },
};

export default function Home({ setActiveTab }) {

  const stats = [
    { value: '240',  label: 'Total Questions',  color: '#3b82f6' },
    { value: '15',   label: 'Space Missions',   color: '#f59e0b' },
    { value: '34',   label: 'Hard Questions',   color: '#ef4444' },
    { value: '6',    label: 'Years Covered',    color: '#10b981' },
  ];

  const features = [
    {
      icon:  <Brain size={28} />,
      title: 'AI Question Classifier',
      desc:  'Predict difficulty & topic instantly using Hybrid ML + Semantic Search.',
      tab:   'classifier',
      cta:   'Open Classifier',
      color: '#6366f1',
      glow:  'rgba(99,102,241,0.25)',
    },
    {
      icon:  <Library size={28} />,
      title: 'PYQ Library',
      desc:  'Practice real ISRO SC exam questions with year & difficulty filters.',
      tab:   'pyq',
      cta:   'Browse Questions',
      color: '#f59e0b',
      glow:  'rgba(245,158,11,0.22)',
    },
    {
      icon:  <MessageSquare size={28} />,
      title: 'AeroBot Tutor',
      desc:  'Get step-by-step explanations on any aerospace or engineering topic.',
      tab:   'chat',
      cta:   'Start Chatting',
      color: '#10b981',
      glow:  'rgba(16,185,129,0.22)',
    },
  ];

  return (
    <div className="home-root">

      {/* ── HERO ──────────────────────────────────────────────────────── */}
      <motion.section
        className="home-hero glass-panel"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
      >
        {/* Background glow blobs */}
        <div className="hero-blob hero-blob--1" />
        <div className="hero-blob hero-blob--2" />

        <div className="home-hero__inner">
          <motion.div
            className="status-pill"
            initial={{ scale: 0.85, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.2 }}
          >
            <span className="pulse-dot" />
            ISRO SC Exam · 2018 – 2023
          </motion.div>

          <motion.h1
            className="orbitron home-hero__title"
            initial={{ y: 32, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.3, duration: 0.7 }}
          >
            Explore the Cosmos<br />with <span className="title-accent">AeroGPT</span>
          </motion.h1>

          <motion.p
            className="home-hero__sub"
            initial={{ y: 16, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.42 }}
          >
            Your AI-powered gateway to aerospace knowledge, ISRO mission insights,
            and intelligent exam preparation.
          </motion.p>

          <motion.div
            className="home-hero__actions"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.55 }}
          >
            <button className="btn-primary" onClick={() => setActiveTab('classifier')}>
              <Rocket size={16} /> Try Question Classifier
            </button>
            <button className="glass-button" onClick={() => setActiveTab('chat')}>
              Chat with AeroBot
            </button>
          </motion.div>
        </div>
      </motion.section>

      {/* ── STATS ─────────────────────────────────────────────────────── */}
      <motion.div
        className="home-stats"
        variants={stagger}
        initial="hidden"
        animate="show"
      >
        {stats.map((s, i) => (
          <motion.div key={i} className="home-stat glass-panel" variants={fadeUp}>
            <div className="home-stat__value orbitron" style={{ color: s.color }}>
              {s.value}
            </div>
            <div className="home-stat__label">{s.label}</div>
          </motion.div>
        ))}
      </motion.div>

      {/* ── FEATURE CARDS ─────────────────────────────────────────────── */}
      <motion.div
        className="home-features"
        variants={stagger}
        initial="hidden"
        animate="show"
      >
        {features.map((f, i) => (
          <motion.button
            key={i}
            className="home-feat glass-panel"
            onClick={() => setActiveTab(f.tab)}
            variants={fadeUp}
            whileHover={{ y: -5, scale: 1.02 }}
            whileTap={{ scale: 0.97 }}
            style={{ '--feat-color': f.color, '--feat-glow': f.glow }}
          >
            <div className="home-feat__icon">{f.icon}</div>
            <h3 className="orbitron home-feat__title">{f.title}</h3>
            <p className="home-feat__desc">{f.desc}</p>
            <div className="home-feat__cta">
              {f.cta} <ChevronRight size={14} />
            </div>
          </motion.button>
        ))}
      </motion.div>

      {/* ── MISSIONS ──────────────────────────────────────────────────── */}
      <section className="home-missions">
        <motion.h2
          className="orbitron home-missions__heading"
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          Explore Space Missions
        </motion.h2>

        <div className="home-missions__scroll">
          {MISSIONS.slice(0, 8).map((mission, i) => (
            <motion.div
              key={mission.id}
              className="glass-panel home-mission-card"
              onClick={() => setActiveTab('missions')}
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.08 }}
              whileHover={{ y: -4, scale: 1.03 }}
              viewport={{ once: true }}
            >
              <h4 className="orbitron home-mission-card__name">{mission.name}</h4>
              <p className="home-mission-card__summary">{mission.summary}</p>
            </motion.div>
          ))}
        </div>
      </section>

    </div>
  );
}