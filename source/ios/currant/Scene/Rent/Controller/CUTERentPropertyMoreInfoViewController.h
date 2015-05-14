//
//  CUTEPropertyMoreInfoViewController.h
//  currant
//
//  Created by Foster Yin on 4/13/15.
//  Copyright (c) 2015 Foster Yin. All rights reserved.
//

#import "FXForms.h"
#import "CUTETicket.h"
#import "CUTEFormViewController.h"


@interface CUTERentPropertyMoreInfoViewController : CUTEFormViewController

@property (strong, nonatomic) CUTETicket *ticket;

@property (nonatomic, copy) dispatch_block_t updateMoreInfoCompletion;

@end
