"use client";

import { motion } from "framer-motion";
import { ChatMessage } from "@/src/hooks/use-chat";
import { UIMapper } from "./ui-mapper";

interface BotMessageProps {
  message: ChatMessage;
}

export const BotMessage = ({ message }: BotMessageProps) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, ease: "easeOut" }}
      className="w-full max-w-full min-w-0"
    >
      <UIMapper message={message} />
    </motion.div>
  );
};

