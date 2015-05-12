//
//  CUTERentTypeListViewController.h
//  currant
//
//  Created by Foster Yin on 3/31/15.
//  Copyright (c) 2015 Foster Yin. All rights reserved.
//

#import <UIKit/UIKit.h>
#import "FXForms.h"
#import "CUTETicket.h"
#import "CUTEFormViewController.h"

@interface CUTERentTypeListViewController : CUTEFormViewController

@property (nonatomic, strong) CUTETicket *ticket;

@property (nonatomic) BOOL singleUseForReedit;

@property (nonatomic, copy) dispatch_block_t updateRentTypeCompletion;


@end
