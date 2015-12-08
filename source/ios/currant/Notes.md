
##Swift使用注意

1. Mansory Swift Demo https://github.com/cnoon/Swift-Masonry/blob/master/Swift-Masonry/MASExampleBasicAnimationView.swift
2. Sequncer 在swift下多线程使用有[问题](https://github.com/berzniz/Sequencer/issues/5)，先用SwiftSequencer替代
3. Mantle 的model 继承，请直接用objc来继承，用swift继承有些bug，而且Mantle作者也不准备让Mantle和Swift更好的工作，该作者准备Swift下静态的机制实现binding，而不是现在的dynamic property https://github.com/Mantle/Mantle/issues/342