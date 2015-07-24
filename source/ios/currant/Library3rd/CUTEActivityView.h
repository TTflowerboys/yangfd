//
//  CUTEActivityView.h
//  currant
//
//  Created by Foster Yin on 7/24/15.
//  Copyright (c) 2015 Foster Yin. All rights reserved.
//

#import <UIKit/UIKit.h>
#import "CUTEActivity.h"

@interface CUTEActivityView : UIView

@property (nonatomic, copy) dispatch_block_t onDismissButtonPressedBlock;

- (CUTEActivityView *)initWithAcitities:(NSArray *)activities;

- (void)show:(BOOL)animated;

- (void)dismiss:(BOOL)animated;

@end
