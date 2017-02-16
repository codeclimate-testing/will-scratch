require 'log4r'
require 'optparse'

module Vagrant
  # Manages the command line interface to Vagrant.
  class CLI < Vagrant.plugin("2", :command)
    def initialize(argv, env)
      super

      @logger = Log4r::Logger.new("vagrant::cli")
      @main_args, @sub_command, @sub_args = split_main_and_subcommand(argv)

      @logger.info("CLI: #{@main_args.inspect} #{@sub_command.inspect} #{@sub_args.inspect}")
    end
    
    def initialize(argv, env)
      super

      @logger = Log4r::Logger.new("vagrant::cli")
      @main_args, @sub_command, @sub_args = split_main_and_subcommand(argv)

      @logger.info("CLI: #{@main_args.inspect} #{@sub_command.inspect} #{@sub_args.inspect}")
    end
  end
end
